import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://kolabolab.com',
      'https://www.kolabolab.com',
      'https://kolabolab-frontend-hp8lo55mo-ayos-projects-22801254.vercel.app',
      'https://kolabolab-frontend-vy5zfz81m-ayos-projects-22801254.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('KolaboLab API')
    .setDescription('Startup collaboration platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  
  // Handle the request
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}