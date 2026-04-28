import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const HF_BASE = 'https://api-inference.huggingface.co/models';
const SUMMARIZATION_MODEL = 'sshleifer/distilbart-cnn-12-6';
const CLASSIFICATION_MODEL = 'facebook/bart-large-mnli';

const CATEGORY_LABELS = ['bug', 'feature request', 'support', 'performance', 'security', 'other'];
const PRIORITY_LABELS = ['critical', 'high priority', 'medium priority', 'low priority'];

const CATEGORY_MAP: Record<string, string> = {
  'bug': 'BUG',
  'feature request': 'FEATURE',
  'support': 'SUPPORT',
  'performance': 'PERFORMANCE',
  'security': 'SECURITY',
  'other': 'OTHER',
};

const PRIORITY_MAP: Record<string, string> = {
  'critical': 'CRITICAL',
  'high priority': 'HIGH',
  'medium priority': 'MEDIUM',
  'low priority': 'LOW',
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string | undefined;
  readonly enabled: boolean;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('HUGGINGFACE_API_KEY');
    this.enabled = !!this.apiKey;
    if (!this.enabled) {
      this.logger.warn('AI analysis disabled — HUGGINGFACE_API_KEY not set');
    }
  }

  async summarize(text: string): Promise<string | null> {
    if (!this.enabled) return null;
    try {
      const res = await this.hfPost<Array<{ summary_text: string }>>(SUMMARIZATION_MODEL, {
        inputs: text.slice(0, 1024),
        parameters: { max_length: 120, min_length: 30 },
      });
      return res?.[0]?.summary_text ?? null;
    } catch (err) {
      this.logger.warn('Summarization failed', err);
      return null;
    }
  }

  async classifyCategory(text: string): Promise<string | null> {
    const label = await this.zeroShot(text, CATEGORY_LABELS);
    return label ? (CATEGORY_MAP[label] ?? null) : null;
  }

  async classifyPriority(text: string): Promise<string | null> {
    const label = await this.zeroShot(text, PRIORITY_LABELS);
    return label ? (PRIORITY_MAP[label] ?? null) : null;
  }

  private async zeroShot(text: string, labels: string[]): Promise<string | null> {
    if (!this.enabled) return null;
    try {
      const res = await this.hfPost<{ labels: string[]; scores: number[] }>(CLASSIFICATION_MODEL, {
        inputs: text.slice(0, 512),
        parameters: { candidate_labels: labels },
      });
      return res?.labels?.[0] ?? null;
    } catch (err) {
      this.logger.warn('Zero-shot classification failed', err);
      return null;
    }
  }

  private async hfPost<T>(model: string, body: unknown): Promise<T | null> {
    const res = await fetch(`${HF_BASE}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HuggingFace ${model} returned ${res.status}: ${text.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  }
}
