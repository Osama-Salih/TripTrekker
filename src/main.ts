import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';

import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  });

  app.set('trust proxy', 1);
  app.use('/api', limiter);
  app.use(helmet()).use(compression()).use(xss());
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // wrap AppModule with UseContainer
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
