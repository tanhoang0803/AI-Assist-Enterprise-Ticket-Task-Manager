# Skill: AI Integration & Queue Processing

## BullMQ Job Flow

### 1. Producer (enqueue on ticket create)

```typescript
// queue/producers/ticket.producer.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TicketProducer {
  constructor(@InjectQueue('ai-analysis') private readonly queue: Queue) {}

  async enqueueAnalysis(ticket: { id: string; title: string; description: string }) {
    await this.queue.add('analyze-ticket', ticket, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}
```

### 2. Processor (consume and call AI)

```typescript
// queue/processors/ai.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('ai-analysis')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<TicketAnalysisJob>) {
    const { id, title, description } = job.data;
    this.logger.log(`Processing AI analysis for ticket ${id}`);

    const result = await this.aiService.analyze({ title, description });

    await this.prisma.ticket.update({
      where: { id },
      data: {
        aiCategory: result.category,
        aiPriority: result.priority,
        aiSummary: result.summary,
        aiProcessedAt: new Date(),
      },
    });

    await this.notificationService.sendSlack({
      message: `Ticket "${title}" analyzed — Priority: ${result.priority}`,
    });

    this.logger.log(`Completed AI analysis for ticket ${id}`);
  }
}
```

## AI Service with Provider Abstraction

```typescript
// modules/ai/ai.service.ts
@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async analyze(input: { title: string; description: string }): Promise<AiResult> {
    const text = `${input.title}\n\n${input.description}`;

    const [category, priority, summary] = await Promise.all([
      this.classify(text),
      this.scorePriority(text),
      this.summarize(text),
    ]);

    return { category, priority, summary };
  }

  private async classify(text: string): Promise<string> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.config.get('HUGGINGFACE_API_KEY')}` },
        body: JSON.stringify({
          inputs: text,
          parameters: { candidate_labels: ['bug', 'feature', 'support', 'performance', 'security'] },
        }),
      },
    );
    const data = await response.json();
    return data.labels[0];
  }

  private async scorePriority(text: string): Promise<string> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.config.get('HUGGINGFACE_API_KEY')}` },
        body: JSON.stringify({ inputs: text }),
      },
    );
    const data = await response.json();
    const score = data[0]?.find((d: any) => d.label === 'NEGATIVE')?.score ?? 0;
    if (score > 0.8) return 'CRITICAL';
    if (score > 0.5) return 'HIGH';
    if (score > 0.3) return 'MEDIUM';
    return 'LOW';
  }

  private async summarize(text: string): Promise<string> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.config.get('HUGGINGFACE_API_KEY')}` },
        body: JSON.stringify({ inputs: text, parameters: { max_length: 100, min_length: 20 } }),
      },
    );
    const data = await response.json();
    return data[0]?.summary_text ?? text.slice(0, 100);
  }
}
```

## Queue Module Setup

```typescript
// queue/queue.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'ai-analysis' }),
  ],
  providers: [TicketProducer, AiProcessor],
  exports: [TicketProducer],
})
export class QueueModule {}
```

## Job Types

```typescript
// queue/jobs/ticket-analysis.job.ts
export interface TicketAnalysisJob {
  id: string;
  title: string;
  description: string;
}

export interface AiResult {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
}
```

## Idempotency Rule
Always check if `aiProcessedAt` is already set before running analysis. If so, skip and log a warning. This prevents double-processing on retries.

```typescript
const ticket = await this.prisma.ticket.findUnique({ where: { id } });
if (ticket?.aiProcessedAt) {
  this.logger.warn(`Ticket ${id} already processed — skipping`);
  return;
}
```
