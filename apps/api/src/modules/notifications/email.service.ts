import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string | undefined;
  private readonly fromEmail: string | undefined;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('SENDGRID_API_KEY');
    this.fromEmail = config.get<string>('SENDGRID_FROM_EMAIL');
    this.enabled = !!(this.apiKey && this.fromEmail);
    if (!this.enabled) {
      this.logger.warn('Email notifications disabled — SENDGRID_API_KEY or SENDGRID_FROM_EMAIL not set');
    }
  }

  async sendTicketAssigned(params: {
    to: string;
    assigneeName: string;
    ticketTitle: string;
    ticketId: string;
    reporterName: string;
  }): Promise<void> {
    if (!this.enabled) return;
    const { to, assigneeName, ticketTitle, ticketId, reporterName } = params;
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#2563eb;margin-bottom:8px">You've been assigned a ticket</h2>
  <p>Hi ${assigneeName},</p>
  <p><strong>${reporterName}</strong> assigned you to:</p>
  <div style="background:#f1f5f9;border-left:4px solid #2563eb;padding:12px 16px;margin:16px 0;border-radius:4px">
    <strong>${ticketTitle}</strong>
  </div>
  <p style="margin-top:24px;font-size:12px;color:#6b7280">Ticket ID: ${ticketId}</p>
</body>
</html>`;

    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: this.fromEmail },
          subject: `Assigned to you: ${ticketTitle}`,
          content: [{ type: 'text/html', value: html }],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`SendGrid error ${res.status}: ${body}`);
      }
    } catch (err) {
      this.logger.error('Failed to send assignment email', err);
    }
  }
}
