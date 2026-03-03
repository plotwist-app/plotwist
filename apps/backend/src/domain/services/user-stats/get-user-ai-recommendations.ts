import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { config } from '@/config'
import { db } from '@/infra/db'
import type { StatsPeriod } from '@/infra/http/schemas/common'

type Input = {
  userId: string
  redis: FastifyRedis
  language: Language
  period?: StatsPeriod
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
}

export async function getUserAIRecommendationsService({
  userId,
  redis,
  language,
  period = 'all',
  dateRange,
}: Input) {
  const cacheKey = `user-stats:${userId}:ai-recommendations:${language}:${period}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const itemDateFilter =
    dateRange?.startDate && dateRange?.endDate
      ? sql` AND updated_at >= ${dateRange.startDate.toISOString()} AND updated_at <= ${dateRange.endDate.toISOString()}`
      : dateRange?.startDate
        ? sql` AND updated_at >= ${dateRange.startDate.toISOString()}`
        : sql``
  const reviewDateFilter =
    dateRange?.startDate && dateRange?.endDate
      ? sql` AND created_at >= ${dateRange.startDate.toISOString()} AND created_at <= ${dateRange.endDate.toISOString()}`
      : dateRange?.startDate
        ? sql` AND created_at >= ${dateRange.startDate.toISOString()}`
        : sql``

  const rows = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE media_type = 'MOVIE')::int as movie_count,
      COUNT(*) FILTER (WHERE media_type = 'TV_SHOW')::int as series_count
    FROM user_items 
    WHERE user_id = ${userId} AND status = 'WATCHED' ${itemDateFilter}
  `)

  const ratingRows = await db.execute(sql`
    SELECT COALESCE(AVG(rating), 0)::numeric(3,1) as avg_rating,
           COUNT(*)::int as total
    FROM reviews WHERE user_id = ${userId} ${reviewDateFilter}
  `)

  const movieCount = Number(rows[0]?.movie_count || 0)
  const seriesCount = Number(rows[0]?.series_count || 0)
  const avgRating = Number(ratingRows[0]?.avg_rating || 0)

  const languageMap: Record<string, string> = {
    'en-US': 'Respond in English.',
    'pt-BR': 'Responda em português brasileiro.',
    'es-ES': 'Responde en español.',
    'fr-FR': 'Réponds en français.',
    'de-DE': 'Antworte auf Deutsch.',
    'it-IT': 'Rispondi in italiano.',
    'ja-JP': '日本語で回答してください。',
  }

  const prompt = `Based on this viewer profile, recommend exactly 3 hidden gems they'd love. Focus on lesser-known titles, not mainstream blockbusters. ${languageMap[language] || languageMap['en-US']}

Profile:
- Watched ${movieCount} movies and ${seriesCount} series
- Average rating: ${avgRating}/5
- Preference: ${movieCount > seriesCount * 1.5 ? 'Strong movie lover' : seriesCount > movieCount * 1.5 ? 'Series binge-watcher' : 'Balanced viewer'}

Return ONLY valid JSON array with exactly 3 objects, no markdown:
[{"title":"Title","reason":"Short 1-sentence reason in the user's language","mediaType":"movie or tv","year":2020}]`

  let recommendations: Array<{
    title: string
    reason: string
    mediaType: 'movie' | 'tv'
    year?: number
  }> = []

  try {
    const openai = new OpenAI({ apiKey: config.openai.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a film curator specializing in hidden gems and underrated titles. Always return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 400,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || '[]'
    recommendations = JSON.parse(raw)
  } catch (err) {
    console.error(
      '[ai-recommendations] OpenAI error:',
      err instanceof Error ? err.message : err
    )
    recommendations = []
  }

  const result = { recommendations }

  if (recommendations.length > 0) {
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24 * 7)
  }

  return result
}
