import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [SlackService, EmailService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
