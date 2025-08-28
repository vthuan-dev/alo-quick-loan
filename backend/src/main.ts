import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  
  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests from these origins
      const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8081',
        'http://127.0.0.1:3000',
      ];
      
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
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
  
  // Swagger configuration
  if (configService.get<boolean>('swagger.enabled', true)) {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('swagger.title', 'ALO Quick Loan API'))
      .setDescription(configService.get<string>('swagger.description', 'API documentation for ALO Quick Loan'))
      .setVersion(configService.get<string>('swagger.version', '1.0'))
      .addBearerAuth()
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.get<string>('swagger.prefix', 'api-docs'),
      app,
      document,
    );
  }
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/${configService.get<string>('swagger.prefix', 'api-docs')}`);
}
bootstrap();
