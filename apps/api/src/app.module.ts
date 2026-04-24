import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration, { configValidationSchema } from './config/configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: false },
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    HealthModule,
    UsersModule,
    TicketsModule,
    TasksModule,
    // Phase 1.7 — TicketsModule
    // Phase 1.8 — TasksModule (frontend-driven)
    // Phase 2.4 — NotificationsModule
    // Phase 2.6 — LogsModule
    // Phase 3.1 — QueueModule
    // Phase 3.2 — AiModule
  ],
})
export class AppModule {}
