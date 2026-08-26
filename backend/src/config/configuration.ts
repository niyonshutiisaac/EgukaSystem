import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  appName: string;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  url: string;
  directUrl: string;
}

export interface RedisConfig {
  url: string;
}

export interface AuthConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
}

export interface RateLimitConfig {
  ttlSeconds: number;
  maxDefault: number;
}

export interface AiConfig {
  groqApiKey: string;
  groqModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  geminiApiKey: string;
  geminiModel: string;
  ollamaUrl: string;
  ollamaModel: string;
}

export const appConfig = registerAs('app', (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  appName: process.env.APP_NAME ?? 'EgukaSystem',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
}));

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
  url: process.env.DATABASE_URL ?? '',
  directUrl: process.env.DATABASE_URL_DIRECT ?? '',
}));

export const redisConfig = registerAs('redis', (): RedisConfig => ({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
}));

export const authConfig = registerAs('auth', (): AuthConfig => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
  accessTtlSeconds: parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? '900', 10),
  refreshTtlSeconds: parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS ?? '2592000', 10),
}));

export const rateLimitConfig = registerAs('rateLimit', (): RateLimitConfig => ({
  ttlSeconds: parseInt(process.env.RATE_LIMIT_TTL_SECONDS ?? '60', 10),
  maxDefault: parseInt(process.env.RATE_LIMIT_MAX_DEFAULT ?? '60', 10),
}));

export const aiConfig = registerAs('ai', (): AiConfig => ({
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openrouterModel: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.2',
}));

export const config = [
  appConfig,
  databaseConfig,
  redisConfig,
  authConfig,
  rateLimitConfig,
  aiConfig,
];
