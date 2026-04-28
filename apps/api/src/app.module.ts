import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import configuration, { configValidationSchema } from './config/configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LogsModule } from './modules/logs/logs.module';
import { QueueModule } from './queue/queue.module';
import { AiModule } from './modules/ai/ai.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { GoogleModule } from './modules/google/google.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: false },
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        pinoHttp: {
          level: cfg.get<string>('nodeEnv') === 'production' ? 'info' : 'debug',
          transport:
            cfg.get<string>('nodeEnv') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : undefined,
          redact: ['req.headers.authorization'],
          autoLogging: { ignore: (req) => req.url === '/health' },
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (_cfg: ConfigService) => ({
        ttl: 30_000,
        max: 500,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    HealthModule,
    UsersModule,
    TicketsModule,
    TasksModule,
    NotificationsModule,
    LogsModule,
    QueueModule,
    AiModule,
    AttachmentsModule,
    GoogleModule,
  ],
})
export class AppModule {}
