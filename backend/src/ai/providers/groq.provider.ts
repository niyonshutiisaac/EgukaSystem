import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiProviderResult } from './ai-provider.interface';

/**
 * Groq free tier — fastest free LLM API (no card required).
 */
@Injectable()
export class GroqProvider implements AiProvider {
  readonly name = 'groq';

  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ai.groqApiKey') ?? '';
    this.model = config.get<string>('ai.groqModel') ?? 'llama-3.3-70b-versatile';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number,
  ): Promise<AiProviderResult> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
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
      throw new Error(`Groq API ${res.status}: ${await res.text()}`);
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
