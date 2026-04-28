import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@database/prisma/prisma.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { TICKET_AI_QUEUE } from '@queue/queue.module';
import { AiService } from '../ai.service';
import type { TicketAiJobData } from '../producers/ticket.producer';

@Processor(TICKET_AI_QUEUE)
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<TicketAiJobData>): Promise<void> {
    const { ticketId, title, description } = job.data;
    this.logger.debug(`Processing AI analysis for ticket ${ticketId}`);

    const text = [title, description].filter(Boolean).join('. ');

    const [summaryResult, categoryResult, priorityResult] = await Promise.allSettled([
      this.aiService.summarize(text),
      this.aiService.classifyCategory(text),
      this.aiService.classifyPriority(text),
    ]);

    const aiSummary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
    const aiCategory = categoryResult.status === 'fulfilled' ? categoryResult.value : null;
    const aiPriority = priorityResult.status === 'fulfilled' ? priorityResult.value : null;

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { aiSummary, aiCategory, aiPriority, aiProcessedAt: new Date() },
    });

    this.logger.log(`AI analysis complete for ticket ${ticketId} — category: ${aiCategory ?? 'none'}, priority: ${aiPriority ?? 'none'}`);

    void this.notifications.onAiProcessed(ticketId, title, aiCategory, aiPriority);
  }
}
