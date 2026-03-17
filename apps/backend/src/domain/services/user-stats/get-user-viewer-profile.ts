import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { config } from '@/config'
import { db } from '@/infra/db'

type Input = {
  userId: string
  redis: FastifyRedis
  language: Language
}

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'en-US': 'Write in English.',
  'pt-BR': 'Escreva em português brasileiro.',
  'es-ES': 'Escribe en español.',
  'fr-FR': 'Écris en français.',
  'de-DE': 'Schreibe auf Deutsch.',
  'it-IT': 'Scrivi in italiano.',
  'ja-JP': '日本語で書いてください。',
}

export async function getUserViewerProfileService({
  userId,
  redis,
  language,
}: Input) {
  const cacheKey = `user-stats:${userId}:viewer-profile:${language}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const [[ratingRow], [itemsRow]] = await Promise.all([
    db.execute<{ avg_rating: string; review_count: number }>(sql`
      SELECT COALESCE(AVG(rating), 0)::numeric(3,1) as avg_rating,
             COUNT(*)::int as review_count
      FROM reviews WHERE user_id = ${userId}
    `),
    db.execute<{
      watched_count: number
      movie_count: number
      series_count: number
      watching_count: number
      watchlist_count: number
    }>(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'WATCHED')::int as watched_count,
        COUNT(*) FILTER (WHERE status = 'WATCHED' AND media_type = 'MOVIE')::int as movie_count,
        COUNT(*) FILTER (WHERE status = 'WATCHED' AND media_type = 'TV_SHOW')::int as series_count,
        COUNT(*) FILTER (WHERE status = 'WATCHING')::int as watching_count,
        COUNT(*) FILTER (WHERE status = 'WATCHLIST')::int as watchlist_count
      FROM user_items WHERE user_id = ${userId}
    `),
  ])

  const stats = {
    avgRating: Number(ratingRow?.avg_rating || 0),
    reviewCount: Number(ratingRow?.review_count || 0),
    watchedCount: Number(itemsRow?.watched_count || 0),
    movieCount: Number(itemsRow?.movie_count || 0),
    seriesCount: Number(itemsRow?.series_count || 0),
    watchingCount: Number(itemsRow?.watching_count || 0),
    watchlistCount: Number(itemsRow?.watchlist_count || 0),
  }

  const preference =
    stats.movieCount > stats.seriesCount
      ? 'Prefers movies'
      : stats.seriesCount > stats.movieCount
        ? 'Prefers series'
        : 'Balanced'

  const languageInstruction =
    LANGUAGE_INSTRUCTIONS[language] || 'Write in English.'

  const prompt = `Based on this viewer's stats, write a 2-3 sentence personality profile that feels personal and insightful. Be specific, witty, and avoid generic statements. ${languageInstruction}

Stats:
- Watched: ${stats.watchedCount} titles (${stats.movieCount} movies, ${stats.seriesCount} series)
- Currently watching: ${stats.watchingCount}
- Watchlist: ${stats.watchlistCount}
- Reviews: ${stats.reviewCount} (average rating: ${stats.avgRating}/5)
- Preference: ${preference}

Write ONLY the profile text, no labels or headers.`

  let profile = ''
  try {
    const openai = new OpenAI({ apiKey: config.openai.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a witty entertainment critic who writes sharp, personalized viewer profiles.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 200,
    })
    profile = completion.choices[0]?.message?.content?.trim() || ''
  } catch (err) {
    console.error('[viewer-profile] OpenAI error:', err instanceof Error ? err.message : err)
  }

  const result = { viewerProfile: profile }

  if (profile) {
    await redis.set(
      cacheKey,
      JSON.stringify(result),
      'EX',
      THIRTY_DAYS_IN_SECONDS
    )
  }

  return result
}
