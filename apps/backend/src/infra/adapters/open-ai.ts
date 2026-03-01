import OpenAI from 'openai'
import { config } from '@/config'
import type { AIService } from '@/infra/ports/ai-service'

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
  generateMessage: (prefix, content) => generateMessage(prefix, content),
}

export { OpenAIService }
