import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly oauth2Client: Auth.OAuth2Client;
  readonly enabled: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const clientId = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = config.get<string>('GOOGLE_REDIRECT_URI', 'http://localhost:4000/api/google/callback');
    this.enabled = !!(clientId && clientSecret);
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    if (!this.enabled) {
      this.logger.warn('Google Calendar disabled — GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
    }
  }

  getAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: userId,
    });
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      this.logger.warn(`No refresh token for user ${userId} — user may need to re-auth`);
      return;
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { googleRefreshToken: tokens.refresh_token },
    });
    this.logger.log(`Saved Google refresh token for user ${userId}`);
  }

  async syncTicketToCalendar(params: {
    assigneeId: string;
    ticketId: string;
    ticketTitle: string;
    dueDate: Date;
    description?: string | null;
    existingEventId?: string | null;
  }): Promise<string | null> {
    if (!this.enabled) return null;

    const assignee = await this.prisma.user.findUnique({
      where: { id: params.assigneeId },
      select: { googleRefreshToken: true, name: true },
    });

    if (!assignee?.googleRefreshToken) {
      this.logger.warn(`User ${params.assigneeId} has not connected Google Calendar`);
      return null;
    }

    const client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
    );
    client.setCredentials({ refresh_token: assignee.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: client });

    const event = {
      summary: `[Ticket] ${params.ticketTitle}`,
      description: params.description ?? '',
      start: { date: params.dueDate.toISOString().slice(0, 10) },
      end:   { date: params.dueDate.toISOString().slice(0, 10) },
    };

    try {
      if (params.existingEventId) {
        await calendar.events.update({
          calendarId: 'primary',
          eventId: params.existingEventId,
          requestBody: event,
        });
        return params.existingEventId;
      } else {
        const res = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });
        return res.data.id ?? null;
      }
    } catch (err) {
      this.logger.error(`Google Calendar API error for ticket ${params.ticketId}`, err);
      return null;
    }
  }
}
