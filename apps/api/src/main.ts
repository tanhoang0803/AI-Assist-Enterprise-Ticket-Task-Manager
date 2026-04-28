import 'reflect-metadata';
import { join } from 'node:path';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const logger = app.get(Logger);
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Serve uploaded files
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      config.get<string>('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Global prefix
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Global guards
  app.useGlobalGuards(new RolesGuard(reflector));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger — dev only
  if (config.get<string>('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AI-Assist Ticket & Task Manager API')
      .setDescription('Enterprise ticket management with AI-assisted workflows')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addTag('health', 'Health check endpoints')
      .addTag('auth', 'Authentication')
      .addTag('users', 'User management')
      .addTag('tickets', 'Ticket management')
      .addTag('tasks', 'Task management')
      .addTag('notifications', 'Notifications')
      .addTag('ai', 'AI analysis')
      .addTag('logs', 'Audit logs')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log('Swagger docs → http://localhost:4000/api/docs');
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  logger.log(`API running → http://localhost:${port}`);
}

void bootstrap();
