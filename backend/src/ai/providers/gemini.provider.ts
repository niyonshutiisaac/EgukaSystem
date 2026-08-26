import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiProviderResult } from './ai-provider.interface';

/**
 * Google Gemini free tier (gemini-2.0-flash) — free API key, generous free quota.
 */
@Injectable()
export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';

  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ai.geminiApiKey') ?? '';
    this.model = config.get<string>('ai.geminiModel') ?? 'gemini-2.0-flash';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number,
  ): Promise<AiProviderResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: { totalTokenCount?: number };
    };
    return {
      text: data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '',
      model: this.model,
      tokensUsed: data.usageMetadata?.totalTokenCount ?? 0,
    };
  }
}
