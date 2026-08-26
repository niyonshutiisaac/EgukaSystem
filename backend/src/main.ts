import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Trust Render's proxy (needed for correct IP + secure cookies behind LB)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());
  app.use(
    pinoHttp({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      autoLogging: true,
    }),
  );

  const corsOrigins = config.get<string[]>('app.corsOrigins') ?? [
    'http://localhost:5173',
    'https://egukasystem.vercel.app',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EgukaSystem API')
    .setDescription('Multi-tenant Business Operating System for Rwandan SMEs')
    .setVersion('1.0')
    .addServer('https://egukasystem-api.onrender.com', 'Production (Render)')
    .addServer('http://localhost:3000', 'Local')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('app.port') ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`EgukaSystem API running on http://0.0.0.0:${port} (${config.get('app.nodeEnv')})`);
  logger.log(`CORS origins: ${(corsOrigins ?? []).join(', ')}`);
  logger.log(`Docs: http://0.0.0.0:${port}/docs`);
}

void bootstrap();
