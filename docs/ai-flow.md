# AI Processing Flow — Deep Dive

## Overview

The AI layer is deliberately decoupled from the main request/response cycle. Heavy AI inference calls never block the HTTP response.

## Sequence

```
[HTTP] POST /tickets
       │
       ▼
[NestJS] TicketsService.create()
       │ Saves ticket to DB
       │
       ▼
[NestJS] TicketProducer.enqueueAnalysis()
       │ Adds job to BullMQ "ai-analysis" queue
       │
       ▼ (immediate HTTP 201 response to client)

[ASYNC] Redis Queue receives job
       │
       ▼
[BullMQ] AiProcessor.process()
       │ Picks job from queue
       │
       ├──▶ AiService.classify(text)
       │    └─▶ Hugging Face bart-large-mnli
       │        └─▶ Returns: "bug" | "feature" | "support" | etc.
       │
       ├──▶ AiService.scorePriority(text)
       │    └─▶ Hugging Face distilbert
       │        └─▶ Returns: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
       │
       └──▶ AiService.summarize(text)
            └─▶ Hugging Face bart-large-cnn
                └─▶ Returns: 1-2 sentence summary

       │ (all 3 calls run concurrently via Promise.all)
       │
       ▼
[DB] PrismaService.ticket.update()
       │ Saves: aiCategory, aiPriority, aiSummary, aiProcessedAt
       │
       ▼
[Notify] NotificationService
       │ Slack: "Ticket X analyzed — Priority: HIGH"
       └─▶ SendGrid: email to assignee
```

## Hugging Face Models Used

| Task | Model | Notes |
|---|---|---|
| Categorization | `facebook/bart-large-mnli` | Zero-shot classification |
| Priority scoring | `distilbert-base-uncased-finetuned-sst-2-english` | Sentiment as urgency proxy |
| Summarization | `facebook/bart-large-cnn` | CNN-trained summarizer |

## Error Handling

- **Retry**: 3 attempts, exponential backoff (2s, 4s, 8s)
- **Idempotency**: Check `aiProcessedAt` before processing — skip if already done
- **Dead letter**: Failed jobs after 3 attempts move to failed queue (visible in Bull Board)
- **Fallback**: If HuggingFace fails, AiService can switch to OpenAI (toggle via env)

## Monitoring

- **Bull Board**: `GET /admin/queues` — shows active, waiting, failed jobs
- **Logs**: Every job start/success/failure is logged with ticket ID
- **DB flag**: `aiProcessedAt` shows when/if AI completed for each ticket

## Frontend Representation

- Ticket detail shows "AI Processing..." badge when `aiProcessedAt` is null
- Once processed, shows category, priority, and summary with "AI suggested" label
- Manual re-analyze button calls `POST /ai/analyze` endpoint
