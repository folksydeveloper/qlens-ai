import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || '';
}

async function bootstrap() {
  requiredEnv('API_SERVICE_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-service-secret');

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean);

  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'anthropic-version', 'x-request-id'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Keep one and only one public API prefix. Controllers must not repeat `v1`.
  app.setGlobalPrefix('v1');

  const port = parseInt(process.env.GATEWAY_PORT || '3002', 10);
  await app.listen(port);
  Logger.log(`QLens Gateway running on http://localhost:${port}/v1`, 'Bootstrap');
}

bootstrap();
