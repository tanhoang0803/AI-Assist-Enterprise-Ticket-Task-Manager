import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly token: string | undefined;
  private readonly channelId: string | undefined;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    this.token = config.get<string>('SLACK_BOT_TOKEN');
    this.channelId = config.get<string>('SLACK_CHANNEL_ID');
    this.enabled = !!(this.token && this.channelId);
    if (!this.enabled) {
      this.logger.warn('Slack notifications disabled — SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set');
    }
  }

  async postMessage(text: string): Promise<void> {
    if (!this.enabled) return;
    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: this.channelId, text, mrkdwn: true }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        this.logger.error(`Slack API error: ${json.error ?? 'unknown'}`);
      }
    } catch (err) {
      this.logger.error('Failed to post Slack message', err);
    }
  }
}
