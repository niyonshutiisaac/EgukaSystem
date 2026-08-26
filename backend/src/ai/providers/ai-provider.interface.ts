export interface AiProviderResult {
  text: string;
  model: string;
  tokensUsed: number;
}

export interface AiProvider {
  readonly name: string;
  /** Returns null when the provider is not configured. */
  isConfigured(): boolean;
  generate(systemPrompt: string, userPrompt: string, timeoutMs: number): Promise<AiProviderResult>;
}
