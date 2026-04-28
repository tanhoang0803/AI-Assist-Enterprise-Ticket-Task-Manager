import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Redirect,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '@common/decorators/current-user.decorator';
import { PrismaService } from '@database/prisma/prisma.service';
import { CalendarService } from './calendar.service';

@ApiTags('google')
@Controller('google')
export class GoogleController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Google OAuth URL to connect Calendar' })
  connect(@CurrentUser() user: AuthUser) {
    if (!this.calendarService.enabled) {
      throw new BadRequestException('Google Calendar integration is not configured');
    }
    return { url: this.calendarService.getAuthUrl(user.id) };
  }

  @Get('callback')
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth callback — exchanges code for tokens' })
  async callback(
    @Query('code') code: string,
    @Query('state') userId: string,
    @Query('error') error?: string,
  ) {
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    if (error || !code) {
      return { url: `${frontendUrl}/settings?calendar=error` };
    }
    try {
      await this.calendarService.handleCallback(code, userId);
      return { url: `${frontendUrl}/settings?calendar=connected` };
    } catch {
      return { url: `${frontendUrl}/settings?calendar=error` };
    }
  }

  @Post('tickets/:ticketId/calendar-sync')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sync ticket due date to assignee Google Calendar' })
  async syncTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser() _user: AuthUser,
  ) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        assigneeId: true,
        calendarEventId: true,
      },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);
    if (!ticket.dueDate) throw new BadRequestException('Ticket has no due date');
    if (!ticket.assigneeId) throw new BadRequestException('Ticket has no assignee');

    const eventId = await this.calendarService.syncTicketToCalendar({
      assigneeId: ticket.assigneeId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      dueDate: ticket.dueDate,
      description: ticket.description,
      existingEventId: ticket.calendarEventId,
    });

    if (eventId) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { calendarEventId: eventId },
      });
    }

    return { synced: !!eventId, calendarEventId: eventId };
  }
}
