import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { SlackService } from './slack.service';
import { EmailService } from './email.service';

export interface NotifiableTicket {
  id: string;
  title: string;
  priority: string;
  status: string;
  assigneeId: string | null;
  reporter: { name: string };
  assignee: { name: string } | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly slack: SlackService,
    private readonly email: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async onTicketCreated(ticket: NotifiableTicket): Promise<void> {
    const text =
      `*New ticket created* :ticket:\n` +
      `*Title:* ${ticket.title}\n` +
      `*Priority:* ${ticket.priority}\n` +
      `*Reporter:* ${ticket.reporter.name}`;
    await this.slack.postMessage(text);
  }

  async onTicketAssigned(ticket: NotifiableTicket, previousAssigneeId: string | null): Promise<void> {
    if (!ticket.assigneeId || ticket.assigneeId === previousAssigneeId) return;

    const text =
      `*Ticket assigned* :busts_in_silhouette:\n` +
      `*Title:* ${ticket.title}\n` +
      `*Assignee:* ${ticket.assignee?.name ?? 'Unknown'}`;
    await this.slack.postMessage(text);

    const assigneeUser = await this.prisma.user.findUnique({
      where: { id: ticket.assigneeId },
      select: { email: true, name: true },
    });
    if (assigneeUser?.email) {
      await this.email.sendTicketAssigned({
        to: assigneeUser.email,
        assigneeName: assigneeUser.name,
        ticketTitle: ticket.title,
        ticketId: ticket.id,
        reporterName: ticket.reporter.name,
      });
    }
  }

  async onTicketStatusChanged(ticket: NotifiableTicket, oldStatus: string): Promise<void> {
    const text =
      `*Ticket status changed* :arrows_counterclockwise:\n` +
      `*Title:* ${ticket.title}\n` +
      `*Status:* ${oldStatus} → ${ticket.status}`;
    await this.slack.postMessage(text);
  }

  async onAiProcessed(_ticketId: string, ticketTitle: string, aiCategory: string | null, aiPriority: string | null): Promise<void> {
    const text =
      `*AI analysis complete* :robot_face:\n` +
      `*Ticket:* ${ticketTitle}\n` +
      `*Suggested category:* ${aiCategory ?? 'n/a'}\n` +
      `*Suggested priority:* ${aiPriority ?? 'n/a'}`;
    await this.slack.postMessage(text);
  }
}
