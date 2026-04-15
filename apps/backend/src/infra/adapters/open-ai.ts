import OpenAI from 'openai'
import { config } from '@/config'
import type { AIService } from '@/infra/ports/ai-service'

const openai = new OpenAI({
  apiKey: config.intelligence.OPENAI_API_KEY,
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

async function generateJSON(params: {
  system: string
  user: string
  temperature?: number
  maxTokens?: number
}) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ],
    temperature: params.temperature ?? 0.5,
    max_tokens: params.maxTokens ?? 600,
  })

  return response.choices[0].message.content?.trim() || '[]'
}

const OpenAIService: AIService = {
  generateMessage: (prefix, content) => generateMessage(prefix, content),
  generateJSON: params => generateJSON(params),
}

export { OpenAIService }
