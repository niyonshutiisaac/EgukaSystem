import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiProviderResult } from './ai-provider.interface';

/**
 * Ollama — fully local & free. Point OLLAMA_URL at a self-hosted instance
 * (docker run -d -p 11434:11434 ollama/ollama) for zero-cost unlimited use.
 */
@Injectable()
export class OllamaProvider implements AiProvider {
  readonly name = 'ollama';

  private readonly url: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.url = config.get<string>('ai.ollamaUrl') ?? 'http://localhost:11434';
    this.model = config.get<string>('ai.ollamaModel') ?? 'llama3.2';
  }

  isConfigured(): boolean {
    return this.url.length > 0; // always "configured" — connection is checked lazily
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number,
  ): Promise<AiProviderResult> {
    const res = await fetch(`${this.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
        options: { temperature: 0.4, num_predict: 1200 },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Ollama API ${res.status}`);
    }
    const data = (await res.json()) as { response?: string; eval_count?: number };
    return {
      text: data.response ?? '',
      model: `ollama:${this.model}`,
      tokensUsed: data.eval_count ?? 0,
    };
  }
}
