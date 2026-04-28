import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TicketProducer } from './producers/ticket.producer';
import { AiProcessor } from './processors/ai.processor';

@Module({
  imports: [NotificationsModule],
  controllers: [AiController],
  providers: [AiService, TicketProducer, AiProcessor],
  exports: [TicketProducer],
})
export class AiModule {}
