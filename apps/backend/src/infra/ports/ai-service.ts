export interface AIService {
  generateMessage(prefix: string, content: string): Promise<string>
  generateJSON(params: {
    system: string
    user: string
    temperature?: number
    maxTokens?: number
  }): Promise<string>
}
