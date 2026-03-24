import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { config } from '@/config'
import { tmdb } from '@/infra/adapters/tmdb'
import { db } from '@/infra/db'
import type { StatsPeriod } from '@/infra/http/schemas/common'

type Input = {
  userId: string
  redis: FastifyRedis
  language: Language
  period?: StatsPeriod
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
}

const MIN_VOTE_COUNT = 3000
const COLD_START_THRESHOLD = 5

type Candidate = {
  tmdbId: number
  title: string
  year?: number
  mediaType: 'movie' | 'tv'
}

type Rec = {
  title: string
  reason: string
  mediaType: 'movie' | 'tv'
  year?: number
  tmdbId?: number
}

type SearchHit = {
  id: number
  media_type?: string
  vote_count?: number
  title?: string
  name?: string
}

function normalizeTitle(s: string): string {
  return s.trim().toLowerCase()
}

function hitTitle(h: SearchHit): string {
  return (h.title ?? h.name ?? '').trim()
}

const languageMap: Record<string, string> = {
  'en-US': 'Respond in English.',
  'pt-BR': 'Responda em português brasileiro.',
  'es-ES': 'Responde en español.',
  'fr-FR': 'Réponds en français.',
  'de-DE': 'Antworte auf Deutsch.',
  'it-IT': 'Rispondi in italiano.',
  'ja-JP': '日本語で回答してください。',
}

async function buildCandidatePool(
  seeds: Array<{ tmdb_id: number; media_type: string }>,
  exclusionSet: Set<string>,
  language: Language
): Promise<Candidate[]> {
  const allCandidates: Candidate[] = []

  await Promise.all(
    seeds.map(async seed => {
      try {
        const isMovie = seed.media_type === 'MOVIE'

        if (isMovie) {
          const related = await tmdb.movies.related(
            seed.tmdb_id,
            'recommendations',
            language
          )
          for (const r of related.results ?? []) {
            if (
              !exclusionSet.has(`${r.id}-movie`) &&
              (r.vote_count ?? 0) >= MIN_VOTE_COUNT
            ) {
              allCandidates.push({
                tmdbId: r.id,
                title: r.title,
                year: r.release_date
                  ? Number.parseInt(r.release_date.split('-')[0])
                  : undefined,
                mediaType: 'movie',
              })
            }
          }
        } else {
          const related = await tmdb.tv.related(
            seed.tmdb_id,
            'recommendations',
            language
          )
          for (const r of related.results ?? []) {
            if (
              !exclusionSet.has(`${r.id}-tv`) &&
              (r.vote_count ?? 0) >= MIN_VOTE_COUNT
            ) {
              allCandidates.push({
                tmdbId: r.id,
                title: r.name,
                year: r.first_air_date
                  ? Number.parseInt(r.first_air_date.split('-')[0])
                  : undefined,
                mediaType: 'tv',
              })
            }
          }
        }
      } catch {
        // Ignore individual TMDB errors — other seeds will still contribute
      }
    })
  )

  // Deduplicate by tmdbId-mediaType
  const seen = new Set<string>()
  return allCandidates.filter(c => {
    const key = `${c.tmdbId}-${c.mediaType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function resolveTmdbId(
  rec: Omit<Rec, 'tmdbId'>,
  exclusionSet: Set<string>,
  language: Language
): Promise<Rec | null> {
  try {
    const search = await tmdb.search.multi(rec.title, language)
    const results = ((search as { results?: SearchHit[] }).results ??
      []) as SearchHit[]
    const mediaType = rec.mediaType
    const candidates = results.filter(
      r =>
        (r.media_type === 'movie' || r.media_type === 'tv') &&
        r.media_type === mediaType
    )
    if (candidates.length === 0) return null

    const recNorm = normalizeTitle(rec.title)
    const byTitleMatch = candidates.filter(
      r => normalizeTitle(hitTitle(r)) === recNorm
    )
    const pool = byTitleMatch.length > 0 ? byTitleMatch : candidates
    const match = pool.reduce((best, r) =>
      (r.vote_count ?? 0) > (best.vote_count ?? 0) ? r : best
    )

    if (exclusionSet.has(`${match.id}-${mediaType}`)) return null
    if ((match.vote_count ?? 0) < MIN_VOTE_COUNT) return null

    return { ...rec, tmdbId: match.id }
  } catch {
    return null
  }
}

async function fetchItemTitle(
  tmdbId: number,
  mediaType: string,
  language: Language
): Promise<string | null> {
  try {
    if (mediaType === 'MOVIE') {
      const d = await tmdb.movies.details(tmdbId, language)
      return (d as { title?: string }).title ?? null
    }
    const d = await tmdb.tv.details(tmdbId, language)
    return (d as { name?: string }).name ?? null
  } catch {
    return null
  }
}

export async function getUserAIRecommendationsService({
  userId,
  redis,
  language,
  period = 'all',
  dateRange,
}: Input) {
  const cacheKey = `user-stats:${userId}:ai-recommendations:v5:${language}:${period}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const itemDateFilter =
    dateRange?.startDate && dateRange?.endDate
      ? sql` AND ui.added_at >= ${dateRange.startDate.toISOString()} AND ui.added_at <= ${dateRange.endDate.toISOString()}`
      : dateRange?.startDate
        ? sql` AND ui.added_at >= ${dateRange.startDate.toISOString()}`
        : sql``

  // Watched items with average rating (used for seeding and prompt context)
  const watchedWithRatings = await db.execute<{
    tmdb_id: number
    media_type: string
    avg_rating: string | null
    added_at: string
  }>(sql`
    SELECT ui.tmdb_id, ui.media_type, ui.added_at,
           AVG(r.rating)::numeric(3,1)::text AS avg_rating
    FROM user_items ui
    LEFT JOIN reviews r
      ON r.tmdb_id = ui.tmdb_id
      AND r.user_id = ui.user_id
      AND r.media_type = ui.media_type
    WHERE ui.user_id = ${userId} AND ui.status = 'WATCHED' ${itemDateFilter}
    GROUP BY ui.tmdb_id, ui.media_type, ui.added_at
    ORDER BY avg_rating DESC NULLS LAST, ui.added_at DESC
  `)

  // Exclusion set: ALL statuses (WATCHED, WATCHING, DROPPED, WATCHLIST)
  const allEngagedRows = await db.execute<{
    tmdb_id: number
    media_type: string
  }>(sql`
    SELECT tmdb_id, media_type FROM user_items WHERE user_id = ${userId}
  `)

  const exclusionSet = new Set(
    allEngagedRows.map(
      r => `${r.tmdb_id}-${r.media_type === 'TV_SHOW' ? 'tv' : 'movie'}`
    )
  )

  const watchedCount = watchedWithRatings.length
  const toRating = (v: string | null) => (v != null ? parseFloat(v) : null)

  // Seeds: items rated >= 3 (or unrated) — used to drive TMDB related API
  const seeds = watchedWithRatings
    .filter(r => {
      const rating = toRating(r.avg_rating)
      return rating === null || rating >= 3
    })
    .slice(0, 10)

  // Loved / disliked for prompt context
  const lovedItems = watchedWithRatings
    .filter(r => (toRating(r.avg_rating) ?? 0) >= 4)
    .slice(0, 3)

  const dislikedItems = watchedWithRatings
    .filter(r => {
      const rating = toRating(r.avg_rating)
      return rating !== null && rating <= 2
    })
    .slice(0, 3)

  const openai = new OpenAI({ apiKey: config.openai.OPENAI_API_KEY })
  const systemPrompt =
    'You are a personal film & TV curator. Given candidate titles and a user taste profile, select the best matches. Respond ONLY with valid JSON, no markdown.'

  let recommendations: Rec[] = []

  if (watchedCount >= COLD_START_THRESHOLD) {
    // Standard path: build candidate pool via TMDB + fetch titles for context
    const [candidates, lovedTitles, dislikedTitles] = await Promise.all([
      buildCandidatePool(seeds, exclusionSet, language),
      Promise.all(
        lovedItems.map(async item => ({
          title: await fetchItemTitle(item.tmdb_id, item.media_type, language),
          rating: toRating(item.avg_rating),
        }))
      ),
      Promise.all(
        dislikedItems.map(async item => ({
          title: await fetchItemTitle(item.tmdb_id, item.media_type, language),
          rating: toRating(item.avg_rating),
        }))
      ),
    ])

    if (candidates.length < 3) {
      // Not enough candidates (edge case: all related items already watched)
      // Fall through to cold start path below by setting watchedCount signal
      console.log(
        '[ai-recommendations] candidate pool too small, falling back to cold start',
        { candidates: candidates.length }
      )
    } else {
      const lovedLine = lovedTitles
        .filter(r => r.title)
        .map(r => `"${r.title}" (${r.rating}/5)`)
        .join(', ')

      const dislikedLine = dislikedTitles
        .filter(r => r.title)
        .map(r => `"${r.title}" (${r.rating}/5)`)
        .join(', ')

      const candidateList = candidates
        .slice(0, 20)
        .map(c =>
          JSON.stringify({
            title: c.title,
            year: c.year,
            mediaType: c.mediaType,
            tmdbId: c.tmdbId,
          })
        )
        .join('\n')

      const prompt = `User taste profile:
- Watched: ${watchedCount} titles total
${lovedLine ? `- Loved: ${lovedLine}` : ''}
${dislikedLine ? `- Disliked (avoid similar): ${dislikedLine}` : ''}

Candidate titles — pick the 5 best matches for this user:
${candidateList}

${dislikedLine ? 'Do NOT recommend anything tonally or stylistically similar to the disliked titles.' : ''}
${languageMap[language] || languageMap['en-US']}

Return ONLY a valid JSON array with exactly 5 objects:
[{"title":"exact title from list","reason":"1-sentence reason in user's language","mediaType":"movie or tv","year":2020,"tmdbId":12345}]`

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 600,
        })

        const raw = completion.choices[0]?.message?.content?.trim() || '[]'
        const parsed: Rec[] = JSON.parse(raw)

        console.log('[ai-recommendations] OpenAI raw count', parsed.length, {
          candidates: candidates.length,
          lovedCount: lovedTitles.filter(r => r.title).length,
          dislikedCount: dislikedTitles.filter(r => r.title).length,
        })

        // Match back to candidate pool for reliable tmdbId
        const candidateMap = new Map(
          candidates.map(c => [normalizeTitle(c.title), c])
        )
        recommendations = parsed
          .map(rec => {
            const mediaType = rec.mediaType === 'tv' ? 'tv' : 'movie'
            const poolMatch = candidateMap.get(normalizeTitle(rec.title))
            const tmdbId = poolMatch?.tmdbId ?? rec.tmdbId
            return { ...rec, mediaType, tmdbId } as Rec
          })
          .filter(
            rec =>
              rec.tmdbId &&
              !exclusionSet.has(`${rec.tmdbId}-${rec.mediaType}`)
          )
      } catch (err) {
        console.error(
          '[ai-recommendations] OpenAI error (standard):',
          err instanceof Error ? err.message : err
        )
        recommendations = []
      }
    }
  }

  // Cold start path: fewer than threshold watched items OR candidate pool too small
  if (recommendations.length === 0) {
    const movieCount = watchedWithRatings.filter(
      r => r.media_type === 'MOVIE'
    ).length
    const seriesCount = watchedWithRatings.filter(
      r => r.media_type === 'TV_SHOW'
    ).length

    const prompt = `Based on this viewer profile, recommend exactly 5 popular, well-known titles. ${languageMap[language] || languageMap['en-US']}

CRITICAL: Only mainstream titles with thousands of TMDB votes. No hidden gems or obscure titles.

Profile:
- Watched: ${movieCount} movies, ${seriesCount} series
- Preference: ${movieCount > seriesCount * 1.5 ? 'Strong movie lover' : seriesCount > movieCount * 1.5 ? 'Series binge-watcher' : 'Balanced viewer'}

Return ONLY valid JSON:
[{"title":"Exact English title as on TMDB","reason":"Short reason in user's language","mediaType":"movie or tv","year":2020}]`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 400,
      })

      const raw = completion.choices[0]?.message?.content?.trim() || '[]'
      const parsed: Array<Omit<Rec, 'tmdbId'>> = JSON.parse(raw)

      console.log(
        '[ai-recommendations] cold start raw count',
        parsed.length,
        parsed.map(r => r.title)
      )

      const resolved = await Promise.all(
        parsed.map(rec =>
          resolveTmdbId(
            {
              ...rec,
              mediaType: rec.mediaType === 'tv' ? 'tv' : 'movie',
            },
            exclusionSet,
            language
          )
        )
      )

      recommendations = resolved.filter((r): r is Rec => r !== null)
    } catch (err) {
      console.error(
        '[ai-recommendations] OpenAI error (cold start):',
        err instanceof Error ? err.message : err
      )
      recommendations = []
    }
  }

  const result = { recommendations: recommendations.slice(0, 3) }

  console.log('[ai-recommendations] returning', result.recommendations.length, {
    titles: result.recommendations.map(r => r.title),
    hasTmdbIds: result.recommendations.every(r => r.tmdbId != null),
  })

  if (result.recommendations.length > 0) {
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24 * 7)
  }

  return result
}
