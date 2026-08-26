import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiProviderResult } from './ai-provider.interface';

/**
 * OpenRouter free models (":free" suffix) — access to many free models
 * (Llama 3.3 70B, Mistral, DeepSeek, etc.) with a single API key.
 */
@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly name = 'openrouter';

  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ai.openrouterApiKey') ?? '';
    this.model =
      config.get<string>('ai.openrouterModel') ?? 'meta-llama/llama-3.3-70b-instruct:free';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number,
  ): Promise<AiProviderResult> {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://egukasystem.com',
        'X-Title': 'EgukaSystem',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
      usage?: { total_tokens?: number };
    };
    return {
      text: data.choices[0]?.message?.content ?? '',
      model: this.model,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }
}
