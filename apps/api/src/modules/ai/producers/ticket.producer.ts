import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TICKET_AI_QUEUE } from '@queue/queue.module';

export interface TicketAiJobData {
  ticketId: string;
  title: string;
  description: string | null;
}

@Injectable()
export class TicketProducer {
  private readonly logger = new Logger(TicketProducer.name);

  constructor(@InjectQueue(TICKET_AI_QUEUE) private readonly queue: Queue) {}

  async enqueueAnalysis(ticketId: string, title: string, description?: string | null): Promise<void> {
    try {
      await this.queue.add(
        'analyze',
        { ticketId, title, description: description ?? null } satisfies TicketAiJobData,
        {
          jobId: `ticket-ai-${ticketId}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      this.logger.debug(`Enqueued AI analysis for ticket ${ticketId}`);
    } catch (err) {
      this.logger.error(`Failed to enqueue AI analysis for ticket ${ticketId}`, err);
    }
  }
}
