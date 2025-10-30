import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix (excluding Swagger docs)
  app.setGlobalPrefix('api', { exclude: ['docs', 'docs/json'] });

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow additional properties for update operations
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Ruizhu E-Commerce API')
    .setDescription('Complete API documentation for Ruizhu e-commerce platform')
    .setVersion('1.0.0')
    .addTag('Products', 'Product management endpoints')
    .addTag('Banners', 'Banner and promotional content endpoints')
    .addTag('Collections', 'Product collection endpoints')
    .addTag('Orders', 'Order management endpoints')
    .addTag('Users', 'User management and authentication endpoints')
    .addTag('Carts', 'Shopping cart endpoints')
    .addTag('Categories', 'Product category endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
