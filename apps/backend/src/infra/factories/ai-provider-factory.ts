import { OpenAIService } from '@/infra/adapters/open-ai'
import type { AIService } from '@/ports/ai-service'

type AIServiceProvider = 'openAI' | 'llama'

export function createAIService(provider: AIServiceProvider): AIService {
  switch (provider) {
    case 'openAI':
      return OpenAIService

    default:
      throw new Error(`Unsupported AI service provider: ${provider}`)
  }
}
