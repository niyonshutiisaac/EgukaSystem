import { Injectable } from '@nestjs/common';
import { AiProvider } from './providers/ai-provider.interface';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { OfflineInsightProvider } from './providers/offline.provider';

const REQUEST_TIMEOUT_MS = 30000;

export interface AiResult {
  text: string;
  model: string;
  tokensUsed: number;
}

/**
 * Provider chain — free models only, cheapest-to-most-expensive isn't a concern
 * because every tier here is free. Priority: Groq > OpenRouter(free) > Gemini
 * > Ollama(local) > offline templates.
 */
@Injectable()
export class AiGatewayService {
  private readonly chain: AiProvider[];

  constructor(
    groq: GroqProvider,
    openrouter: OpenRouterProvider,
    gemini: GeminiProvider,
    ollama: OllamaProvider,
    offline: OfflineInsightProvider,
  ) {
    this.chain = [groq, openrouter, gemini, ollama, offline];
  }

  /**
   * Generates text using the first provider that succeeds. If a configured
   * provider fails (rate limit, outage) it falls through to the next one.
   * The offline provider always succeeds, so this never throws.
   */
  async generate(systemPrompt: string, userPrompt: string): Promise<AiResult> {
    let lastError: string | null = null;

    for (const provider of this.chain) {
      if (provider.name !== 'offline' && !provider.isConfigured()) continue;
      try {
        const result = await provider.generate(systemPrompt, userPrompt, REQUEST_TIMEOUT_MS);
        if (result.text.trim().length === 0) {
          throw new Error('Empty response');
        }
        return { text: result.text.trim(), model: result.model, tokensUsed: result.tokensUsed };
      } catch (err) {
        lastError = (err as Error).message;
      }
    }

    // Unreachable (offline always succeeds) — defensive.
    throw new Error(`All AI providers failed: ${lastError}`);
  }
}
