import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().default('dev-secret-change-in-production-must-be-long'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  NEXT_PUBLIC_APP_URL: Joi.string().default('http://localhost:3000'),
  AUTH0_DOMAIN: Joi.string().optional().default(''),
  AUTH0_AUDIENCE: Joi.string().optional().default(''),

  HUGGINGFACE_API_KEY: Joi.string().optional(),
  OPENAI_API_KEY: Joi.string().optional(),

  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_REDIRECT_URI: Joi.string().optional().default('http://localhost:4000/api/google/callback'),

  SLACK_BOT_TOKEN: Joi.string().optional(),
  SLACK_CHANNEL_ID: Joi.string().optional(),
  SENDGRID_API_KEY: Joi.string().optional(),
  SENDGRID_FROM_EMAIL: Joi.string().optional(),
});

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: { url: string };
  redis: { host: string; port: number; password?: string };
  jwtSecret: string;
  jwtExpiresIn: string;
  auth0: { domain: string; audience: string };
  huggingface: { apiKey?: string };
  openai: { apiKey?: string };
  slack: { botToken?: string; channelId?: string };
  sendgrid: { apiKey?: string; fromEmail?: string };
  google: { clientId?: string; clientSecret?: string; redirectUri: string };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: { url: process.env.DATABASE_URL ?? '' },
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production-must-be-long',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  auth0: {
    domain: process.env.AUTH0_DOMAIN ?? '',
    audience: process.env.AUTH0_AUDIENCE ?? '',
  },
  huggingface: { apiKey: process.env.HUGGINGFACE_API_KEY },
  openai: { apiKey: process.env.OPENAI_API_KEY },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    channelId: process.env.SLACK_CHANNEL_ID,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:4000/api/google/callback',
  },
});
