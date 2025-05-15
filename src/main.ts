import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerInterceptorInterceptor } from './logger-interceptor/logger-interceptor.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());

  // Configuration CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // En production, spécifiez l'origine exacte
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Poker API')
    .setDescription('API pour les tables de poker')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalInterceptors(new LoggerInterceptorInterceptor())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
