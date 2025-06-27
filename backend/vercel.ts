import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Enable CORS for Vercel deployment
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://kolabolab.vercel.app', 'https://*.vercel.app']
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // API documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('KolaboLab API')
        .setDescription('Tech-for-good collaboration platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    // Set global prefix
    app.setGlobalPrefix('api');

    await app.init();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Handle the request
  return new Promise((resolve, reject) => {
    expressApp(req, res, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}