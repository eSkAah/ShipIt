import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SessionGuard } from './common/guards/session.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(cookieParser());

  // Global validation pipe
  // Note: We use Zod for validation via ZodValidationPipe in controllers
  // ValidationPipe is only used for basic transformation without strict whitelist
  // to allow Zod schemas to handle validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global session guard
  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);
  app.useGlobalGuards(new SessionGuard(authService, reflector));

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ShipIt API')
    .setDescription('Production-ready SaaS boilerplate API')
    .setVersion('1.0')
    .addCookieAuth('shipit_session')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
