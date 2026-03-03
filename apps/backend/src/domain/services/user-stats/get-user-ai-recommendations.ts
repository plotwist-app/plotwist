import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { config } from '@/config'
import { db } from '@/infra/db'
import { tmdb } from '@/infra/adapters/tmdb'
import type { StatsPeriod } from '@/infra/http/schemas/common'

type Input = {
  userId: string
  redis: FastifyRedis
  language: Language
  period?: StatsPeriod
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
}

const MIN_VOTE_COUNT = 3000

type Rec = { title: string; reason: string; mediaType: 'movie' | 'tv'; year?: number }

type SearchHit = {
  id: number
  media_type?: string
  vote_count?: number
}

async function filterOutWatched(
  recs: Rec[],
  watchedSet: Set<string>,
  language: Language
): Promise<Rec[]> {
  const kept: Rec[] = []
  for (const rec of recs) {
    try {
      const search = await tmdb.search.multi(rec.title, language)
      const results = ((search as { results?: SearchHit[] }).results ?? []) as SearchHit[]
      const mediaType = rec.mediaType === 'tv' ? 'tv' : 'movie'
      const match = results.find(
        (r: SearchHit) =>
          (r.media_type === 'movie' || r.media_type === 'tv') &&
          r.media_type === mediaType
      )
      if (!match) continue
      if (watchedSet.has(`${match.id}-${mediaType}`)) continue
      const votes = match.vote_count ?? 0
      if (votes < MIN_VOTE_COUNT) continue
      kept.push(rec)
    } catch {
      // On error (e.g. no match), skip this rec so we don't surface obscure/unvalidated titles
    }
  }
  return kept
}

export async function getUserAIRecommendationsService({
  userId,
  redis,
  language,
  period = 'all',
  dateRange,
}: Input) {
  const cacheKey = `user-stats:${userId}:ai-recommendations:v4:${language}:${period}`

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

  const [rows, watchedRows] = await Promise.all([
    db.execute<{ movie_count: number; series_count: number }>(sql`
      SELECT 
        COUNT(*) FILTER (WHERE media_type = 'MOVIE')::int as movie_count,
        COUNT(*) FILTER (WHERE media_type = 'TV_SHOW')::int as series_count
      FROM user_items 
      WHERE user_id = ${userId} AND status = 'WATCHED' ${itemDateFilter}
    `),
    db.execute<{ tmdb_id: number; media_type: string }>(sql`
      SELECT tmdb_id, media_type
      FROM user_items
      WHERE user_id = ${userId} AND status = 'WATCHED'
    `),
  ])

  const ratingRows = await db.execute(sql`
    SELECT COALESCE(AVG(rating), 0)::numeric(3,1) as avg_rating,
           COUNT(*)::int as total
    FROM reviews WHERE user_id = ${userId} ${reviewDateFilter}
  `)

  const movieCount = Number(rows[0]?.movie_count || 0)
  const seriesCount = Number(rows[0]?.series_count || 0)
  const avgRating = Number(ratingRows[0]?.avg_rating || 0)

  const watchedSet = new Set(
    (watchedRows ?? []).map(
      r => `${r.tmdb_id}-${r.media_type === 'TV_SHOW' ? 'tv' : 'movie'}`
    )
  )

  const languageMap: Record<string, string> = {
    'en-US': 'Respond in English.',
    'pt-BR': 'Responda em português brasileiro.',
    'es-ES': 'Responde en español.',
    'fr-FR': 'Réponds en français.',
    'de-DE': 'Antworte auf Deutsch.',
    'it-IT': 'Rispondi in italiano.',
    'ja-JP': '日本語で回答してください。',
  }

  const prompt = `Based on this viewer profile, recommend exactly 3 popular, well-known titles they'd love. ${languageMap[language] || languageMap['en-US']}

CRITICAL: Recommend ONLY mainstream, widely known titles: big releases, award winners, or titles with broad appeal (thousands of votes on TMDB). Do NOT suggest: hidden gems, underrated films, niche titles, obscure films, shorts, or little-known releases. Do NOT recommend any title the user has already watched.

Profile:
- Watched ${movieCount} movies and ${seriesCount} series
- Average rating: ${avgRating}/5
- Preference: ${movieCount > seriesCount * 1.5 ? 'Strong movie lover' : seriesCount > movieCount * 1.5 ? 'Series binge-watcher' : 'Balanced viewer'}

Return ONLY valid JSON array with exactly 5 objects (popular titles only; obscure ones will be filtered out), no markdown:
[{"title":"Exact English title as on TMDB","reason":"Short 1-sentence reason in the user's language","mediaType":"movie or tv","year":2020}]`

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
            'You are a film curator. Recommend only popular, mainstream titles (high visibility, many votes on TMDB). Do not suggest hidden gems or obscure titles. Always return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
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

  const filtered = await filterOutWatched(recommendations, watchedSet, language)
  const result = { recommendations: filtered.slice(0, 3) }

  if (filtered.length > 0) {
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24 * 7)
  }

  return result
}
