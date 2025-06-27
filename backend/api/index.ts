import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

let app: any;

async function createApp() {
  if (!app) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    app = await NestFactory.create(AppModule, adapter);
    
    // CORS configuration for Vercel
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://kolabolab.vercel.app',
        'https://kolabolab-frontend.vercel.app',
        /\.vercel\.app$/
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Set API prefix
    app.setGlobalPrefix('api');

    // Swagger documentation (only in development)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('KolaboLab API')
        .setDescription('The KolaboLab API for startup collaboration platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}