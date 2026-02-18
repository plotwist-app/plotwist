import OpenAI from 'openai'
import { config } from '@/config'
import { withAdapterTracing } from '@/infra/telemetry/with-adapter-tracing'
import type { AIService } from '@/ports/ai-service'

const openai = new OpenAI({
  apiKey: config.openai.OPENAI_API_KEY,
})

async function generateMessage(prompt: string, content: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 200,
  })

  return response.choices[0].message.content || ''
}

const OpenAIService: AIService = {
  generateMessage: withAdapterTracing('openai-generate-message', generateMessage),
}

export { OpenAIService }
