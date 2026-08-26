import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiGatewayService } from './ai-gateway.service';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { OfflineInsightProvider } from './providers/offline.provider';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiGatewayService,
    GroqProvider,
    OpenRouterProvider,
    GeminiProvider,
    OllamaProvider,
    OfflineInsightProvider,
  ],
  exports: [AiService],
})
export class AiModule {}
