import { hash } from 'bcryptjs'

export const generateShortUrl = async (url: string) => {
  const hashedUrl = await hash(url, 10)
  return hashedUrl
}
