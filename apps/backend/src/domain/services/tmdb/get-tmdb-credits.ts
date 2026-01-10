import type { FastifyRedis } from '@fastify/redis'
import type { Credits } from '@plotwist_app/tmdb'
import { tmdb } from '@/adapters/tmdb'

type GetTMDBCreditsInput = Parameters<typeof tmdb.credits>

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60

export async function getTMDBCredits(
  redis: FastifyRedis,
  [variant, id, language]: GetTMDBCreditsInput
) {
  const cacheKey = `CREDITS:${variant}:${id}:${language}`
  const cachedResult = await redis.get(cacheKey)

  if (cachedResult) {
    return JSON.parse(cachedResult) as Credits
  }

  const data = await tmdb.credits(variant, id, language)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', THIRTY_DAYS_IN_SECONDS)

  return data
}
