import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { config } from '@/config'
import { db } from '@/infra/db'
import type { StatsPeriod } from '@/infra/http/schemas/common'
import { getUserWatchedCountriesService } from './get-user-watched-countries'
import { getUserWatchedGenresService } from './get-user-watched-genres'

type Input = {
  userId: string
  redis: FastifyRedis
  language: Language
  period: StatsPeriod
  dateRange: { startDate: Date | undefined; endDate: Date | undefined }
}

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'en-US': 'Write in English.',
  'pt-BR': 'Escreva em português brasileiro.',
  'es-ES': 'Escribe en español.',
  'fr-FR': 'Écris en français.',
  'de-DE': 'Schreibe auf Deutsch.',
  'it-IT': 'Scrivi in italiano.',
  'ja-JP': '日本語で書いてください。',
}

export async function getUserTasteDNAService({
  userId,
  redis,
  language,
  period,
  dateRange,
}: Input) {
  const cacheKey = `user-stats:${userId}:taste-dna:v7:${period}:${language}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const reviewDateFilter = dateRange.startDate
    ? dateRange.endDate
      ? sql` AND created_at >= ${dateRange.startDate.toISOString()} AND created_at <= ${dateRange.endDate.toISOString()}`
      : sql` AND created_at >= ${dateRange.startDate.toISOString()}`
    : sql``

  const itemDateFilter = dateRange.startDate
    ? dateRange.endDate
      ? sql` AND updated_at >= ${dateRange.startDate.toISOString()} AND updated_at <= ${dateRange.endDate.toISOString()}`
      : sql` AND updated_at >= ${dateRange.startDate.toISOString()}`
    : sql``

  const [
    genresResult,
    countriesResult,
    ratingResult,
    recentActivity,
    reviewSnippetsResult,
  ] = await Promise.all([
    getUserWatchedGenresService({
      userId,
      redis,
      language,
      period,
    }),
    getUserWatchedCountriesService({
      userId,
      redis,
      language,
      period,
    }),
    db.execute<{ avg_rating: string; review_count: number }>(sql`
        SELECT COALESCE(AVG(rating), 0)::numeric(3,1) as avg_rating,
               COUNT(*)::int as review_count
        FROM reviews WHERE user_id = ${userId}${reviewDateFilter}
      `),
    db.execute<{
      total_watched: number
      movie_count: number
      series_count: number
    }>(sql`
        SELECT
          COUNT(*)::int as total_watched,
          COUNT(*) FILTER (WHERE media_type = 'MOVIE')::int as movie_count,
          COUNT(*) FILTER (WHERE media_type = 'TV_SHOW')::int as series_count
        FROM user_items WHERE user_id = ${userId} AND status = 'WATCHED'${itemDateFilter}
      `),
    db.execute<{ rating: number; snippet: string }>(sql`
        SELECT rating::float as rating,
               LEFT(TRIM(review), 160) as snippet
        FROM reviews
        WHERE user_id = ${userId}${reviewDateFilter}
          AND review IS NOT NULL AND TRIM(review) != ''
        ORDER BY created_at DESC
        LIMIT 12
      `),
  ])

  const topGenres = genresResult.genres.slice(0, 5).map(g => g.name)
  const topCountries = countriesResult.watchedCountries
    .slice(0, 5)
    .map(c => c.name)
  const avgRating = Number(ratingResult[0]?.avg_rating || 0)
  const reviewCount = Number(ratingResult[0]?.review_count || 0)
  const totalWatched = Number(recentActivity[0]?.total_watched || 0)
  const movieCount = Number(recentActivity[0]?.movie_count || 0)
  const seriesCount = Number(recentActivity[0]?.series_count || 0)

  const genreSpread = genresResult.genres.length
  const countrySpread = countriesResult.watchedCountries.length
  const movieRatio =
    totalWatched > 0 ? ((movieCount / totalWatched) * 100).toFixed(0) : '0'

  const reviewSnippets = (reviewSnippetsResult ?? []).map(
    r => `[${r.rating}/5] "${(r.snippet ?? '').replace(/"/g, "'")}"`
  )
  const reviewsBlock =
    reviewSnippets.length > 0
      ? `\n- Sample of what they wrote in reviews (rating + snippet):\n${reviewSnippets.map(s => `  • ${s}`).join('\n')}`
      : ''

  const isAllTime = period === 'all'
  const periodContext = isAllTime ? 'all-time viewing' : `the period ${period}`

  const languageInstruction =
    LANGUAGE_INSTRUCTIONS[language] || 'Write in English.'

  const prompt = `You write a short "Taste DNA" summary for a movie/series stats app. Use the data below. Be factual but warm and direct: write in second person ("You watched...", "Your top genres..."). One light observation is ok. No tarot-style vagueness, no "journey/soul/spirit", no third person.

IMPORTANT: ${languageInstruction} The entire response (archetype, summary, AND traits) must be in this language. Do not use English for traits if the user language is not English.

Viewer data for ${periodContext}:
- ${totalWatched} titles (${movieCount} movies, ${seriesCount} series — ${movieRatio}% movies)
- Top genres: ${topGenres.join(', ') || '—'}
- Countries: ${topCountries.slice(0, 3).join(', ') || '—'} (${countrySpread} total)
- ${genreSpread} genres, ${reviewCount} reviews, avg rating ${avgRating}/5${reviewsBlock}

Return ONLY valid JSON, no markdown. All three fields in the user's language:
1. "archetype": A 2-5 word label for their mix (reference real genres or ratio). No "The ..." or mystical titles.
2. "summary": 2-3 sentences, second person. State what they watched, movie vs series, where content came from, how they rate.
3. "traits": Exactly 3 short data-based labels (2-3 words each), e.g. in Portuguese: "Mais filmes", "Notas altas", "Muito thriller". In English: "Mostly movies", "High rater", "Thriller-heavy". Use the same language as archetype and summary.

When review snippets are provided above, use them to reflect how they talk about what they watch (tone, what they notice, praise or criticize); traits can reference their wording when it fits.

{"archetype":"...","summary":"...","traits":["...","...","..."]}`

  let archetype = ''
  let summary = ''
  let traits: string[] = []

  try {
    const openai = new OpenAI({ apiKey: config.openai.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You write brief viewer summaries from stats data. Use second person, warm but factual. No tarot-style vagueness, no third person. Output valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 280,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || '{}'
    const parsed = JSON.parse(raw)
    archetype = parsed.archetype || ''
    summary = parsed.summary || ''
    traits = Array.isArray(parsed.traits) ? parsed.traits.slice(0, 3) : []
  } catch (err) {
    console.error(
      '[taste-dna] OpenAI error:',
      err instanceof Error ? err.message : err
    )
  }

  const result = {
    tasteDNA: {
      archetype,
      summary,
      traits,
    },
  }

  if (archetype && summary) {
    await redis.set(
      cacheKey,
      JSON.stringify(result),
      'EX',
      SEVEN_DAYS_IN_SECONDS
    )
  }

  return result
}
