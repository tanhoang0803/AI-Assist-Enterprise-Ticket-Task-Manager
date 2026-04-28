import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [GoogleController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class GoogleModule {}
