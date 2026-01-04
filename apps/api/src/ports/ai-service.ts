export interface AIService {
  generateMessage(prefix: string, content: string): Promise<string>
}
