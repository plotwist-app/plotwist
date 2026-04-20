import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { MediaTypeEnum } from '@/@types/media-type-enum'
import { config } from '@/config'
import { tmdb } from '@/infra/adapters/tmdb'
import {
  selectAllUserItems,
  selectWatchedItemsWithAvgRating,
} from '@/infra/db/repositories/user-item-repository'
import { selectUserPreferences } from '@/infra/db/repositories/user-preferences'
import { createAIService } from '@/infra/factories/ai-provider-factory'
import type { StatsPeriod } from '@/infra/http/schemas/common'

type Input = {
  userId: string
  redis: FastifyRedis
  language: Language
  period?: StatsPeriod
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
}

const MOVIE_MIN_VOTE_COUNT = 2000
const TV_MIN_VOTE_COUNT = 200
const COLD_START_THRESHOLD = 5
const ANIME_GENRE_ID = 16

const SYSTEM_PROMPT =
  'You are a personal film, TV & anime curator. Given candidate titles and a user taste profile, select the best matches. Respond ONLY with valid JSON, no markdown.'

type Candidate = {
  tmdbId: number
  title: string
  year?: number
  mediaType: 'movie' | 'tv'
  genres: string[]
}

type Rec = {
  title: string
  reason: string
  mediaType: 'movie' | 'tv'
  year?: number
  tmdbId?: number
}

type WatchedRow = {
  tmdbId: number
  mediaType: MediaTypeEnum
  avgRating: string | null
  addedAt: Date
}

type SearchHit = {
  id: number
  media_type?: string
  vote_count?: number
  title?: string
  name?: string
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10768: 'War & Politics',
}

const LANGUAGE_INSTRUCTION: Record<string, string> = {
  'en-US': 'Respond in English.',
  'pt-BR': 'Responda em português brasileiro.',
  'es-ES': 'Responde en español.',
  'fr-FR': 'Réponds en français.',
  'de-DE': 'Antworte auf Deutsch.',
  'it-IT': 'Rispondi in italiano.',
  'ja-JP': '日本語で回答してください。',
}

// --- Data helpers ---

function toRating(v: string | null): number | null {
  return v != null ? parseFloat(v) : null
}

function normalizeTitle(s: string): string {
  return s.trim().toLowerCase()
}

function hitTitle(h: SearchHit): string {
  return (h.title ?? h.name ?? '').trim()
}

function buildExclusionKey(tmdbId: number, mediaType: MediaTypeEnum): string {
  return `${tmdbId}-${mediaType === 'TV_SHOW' ? 'tv' : 'movie'}`
}

function isGoodSeed(row: WatchedRow): boolean {
  const rating = toRating(row.avgRating)
  return rating === null || rating >= 3
}

function mapGenreIds(genreIds: number[]): string[] {
  return genreIds.map(id => TMDB_GENRE_MAP[id]).filter(Boolean) as string[]
}

// --- TMDB helpers ---

async function fetchMovieCandidates(
  seed: WatchedRow,
  exclusionSet: Set<string>,
  language: Language
): Promise<Candidate[]> {
  const related = await tmdb.movies.related(
    seed.tmdbId,
    'recommendations',
    language
  )
  return (related.results ?? [])
    .filter(
      r =>
        !exclusionSet.has(`${r.id}-movie`) &&
        (r.vote_count ?? 0) >= MOVIE_MIN_VOTE_COUNT
    )
    .map(r => ({
      tmdbId: r.id,
      title: r.title,
      year: r.release_date
        ? Number.parseInt(r.release_date.split('-')[0], 10)
        : undefined,
      mediaType: 'movie' as const,
      genres: mapGenreIds(r.genre_ids ?? []),
    }))
}

async function fetchTvCandidates(
  seed: WatchedRow,
  exclusionSet: Set<string>,
  language: Language
): Promise<Candidate[]> {
  const related = await tmdb.tv.related(
    seed.tmdbId,
    'recommendations',
    language
  )
  return (related.results ?? [])
    .filter(
      r =>
        !exclusionSet.has(`${r.id}-tv`) &&
        (r.vote_count ?? 0) >= TV_MIN_VOTE_COUNT
    )
    .map(r => ({
      tmdbId: r.id,
      title: r.name,
      year: r.first_air_date
        ? Number.parseInt(r.first_air_date.split('-')[0], 10)
        : undefined,
      mediaType: 'tv' as const,
      genres: mapGenreIds(r.genre_ids ?? []),
    }))
}

async function buildCandidatePool(
  seeds: WatchedRow[],
  exclusionSet: Set<string>,
  language: Language
): Promise<Candidate[]> {
  const results = await Promise.all(
    seeds.map(async seed => {
      try {
        return seed.mediaType === 'MOVIE'
          ? fetchMovieCandidates(seed, exclusionSet, language)
          : fetchTvCandidates(seed, exclusionSet, language)
      } catch {
        return []
      }
    })
  )

  const seen = new Set<string>()
  return results.flat().filter(c => {
    const key = `${c.tmdbId}-${c.mediaType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function fetchItemTitle(
  tmdbId: number,
  mediaType: MediaTypeEnum,
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

async function resolveTmdbId(
  rec: Omit<Rec, 'tmdbId'>,
  exclusionSet: Set<string>,
  language: Language
): Promise<Rec | null> {
  try {
    const search = await tmdb.search.multi(rec.title, language)
    const results = ((search as { results?: SearchHit[] }).results ??
      []) as SearchHit[]
    const { mediaType } = rec

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
    if ((match.vote_count ?? 0) < TV_MIN_VOTE_COUNT) return null

    return { ...rec, tmdbId: match.id }
  } catch {
    return null
  }
}

// --- Anime detection ---

function detectIsAnimeFanFromCandidates(
  candidates: Candidate[],
  preferredGenres: string
): boolean {
  if (preferredGenres.includes('Animation')) return true
  const animeCandidates = candidates.filter(c =>
    c.genres.includes('Animation')
  ).length
  return candidates.length > 0 && animeCandidates / candidates.length >= 0.3
}

async function detectIsAnimeFanFromWatched(
  watchedItems: WatchedRow[],
  language: Language
): Promise<boolean> {
  const tvSeeds = watchedItems
    .filter(r => r.mediaType === 'TV_SHOW')
    .slice(0, 3)

  if (tvSeeds.length === 0) return false

  const checks = await Promise.all(
    tvSeeds.map(async item => {
      try {
        const details = await tmdb.tv.details(item.tmdbId, language)
        return ((details as { genres?: { id: number }[] }).genres ?? []).some(
          g => g.id === ANIME_GENRE_ID
        )
      } catch {
        return false
      }
    })
  )

  return checks.some(Boolean)
}

// --- Prompt builders ---

function buildStandardPrompt(params: {
  watchedCount: number
  preferredGenres: string
  lovedLine: string
  dislikedLine: string
  candidateList: string
  isAnimeFan: boolean
  language: Language
}): string {
  const {
    watchedCount,
    preferredGenres,
    lovedLine,
    dislikedLine,
    candidateList,
    isAnimeFan,
    language,
  } = params

  return `User taste profile:
- Watched: ${watchedCount} titles total
${preferredGenres ? `- Preferred genres: ${preferredGenres}` : ''}
${isAnimeFan ? '- This user watches a lot of anime — prioritize anime recommendations.' : ''}
${lovedLine ? `- Loved: ${lovedLine}` : ''}
${dislikedLine ? `- Disliked (avoid similar): ${dislikedLine}` : ''}

Candidate titles — pick the 5 best matches for this user:
${candidateList}

${dislikedLine ? 'Do NOT recommend anything tonally or stylistically similar to the disliked titles.' : ''}
${LANGUAGE_INSTRUCTION[language] || LANGUAGE_INSTRUCTION['en-US']}

Return ONLY a valid JSON array with exactly 5 objects:
[{"title":"exact title from list","reason":"1-sentence reason in user's language","mediaType":"movie or tv","year":2020,"tmdbId":12345}]`
}

function buildColdStartPrompt(params: {
  movieCount: number
  seriesCount: number
  preferredGenres: string
  isAnimeFan: boolean
  language: Language
}): string {
  const { movieCount, seriesCount, preferredGenres, isAnimeFan, language } =
    params
  const preference =
    movieCount > seriesCount * 1.5
      ? 'Strong movie lover'
      : seriesCount > movieCount * 1.5
        ? 'Series binge-watcher'
        : 'Balanced viewer'

  return `Based on this viewer profile, recommend exactly 5 popular, well-known titles. ${LANGUAGE_INSTRUCTION[language] || LANGUAGE_INSTRUCTION['en-US']}

CRITICAL: Only mainstream titles with thousands of TMDB votes. No hidden gems or obscure titles.
${isAnimeFan ? 'IMPORTANT: This user watches a lot of anime — recommend anime titles.' : ''}

Profile:
- Watched: ${movieCount} movies, ${seriesCount} series
- Preference: ${preference}
${preferredGenres ? `- Preferred genres: ${preferredGenres}` : ''}

Return ONLY valid JSON:
[{"title":"Exact English title as on TMDB","reason":"Short reason in user's language","mediaType":"movie or tv","year":2020}]`
}

// --- Main service ---

export async function getUserAIRecommendationsService({
  userId,
  redis,
  language,
  period = 'all',
  dateRange,
}: Input) {
  const cacheKey = `user-stats:${userId}:ai-recommendations:v7:${language}:${period}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const [watchedWithRatings, allEngagedRows, prefs] = await Promise.all([
    selectWatchedItemsWithAvgRating(
      userId,
      dateRange?.startDate,
      dateRange?.endDate
    ) as Promise<WatchedRow[]>,
    selectAllUserItems(userId),
    selectUserPreferences(userId),
  ])

  const exclusionSet = new Set(
    allEngagedRows.map(r => buildExclusionKey(r.tmdbId, r.mediaType))
  )

  const preferredGenres = (prefs[0]?.genreIds ?? [])
    .map(id => TMDB_GENRE_MAP[id])
    .filter(Boolean)
    .join(', ')

  const watchedCount = watchedWithRatings.length
  const aiService = createAIService(
    config.intelligence.RECOMMENDATION_AI_PROVIDER
  )
  let recommendations: Rec[] = []

  // isAnimeFan is determined once and shared between both paths
  let isAnimeFan =
    preferredGenres.includes('Animation') ||
    prefs[0]?.genreIds?.includes(ANIME_GENRE_ID) === true

  if (watchedCount >= COLD_START_THRESHOLD) {
    const movieSeeds = watchedWithRatings
      .filter(r => r.mediaType === 'MOVIE' && isGoodSeed(r))
      .slice(0, 5)

    const tvSeeds = watchedWithRatings
      .filter(r => r.mediaType === 'TV_SHOW' && isGoodSeed(r))
      .slice(0, 5)

    const seeds = [...movieSeeds, ...tvSeeds]

    const lovedItems = watchedWithRatings
      .filter(r => (toRating(r.avgRating) ?? 0) >= 4)
      .slice(0, 3)

    const dislikedItems = watchedWithRatings
      .filter(r => {
        const rating = toRating(r.avgRating)
        return rating !== null && rating <= 2
      })
      .slice(0, 3)

    const [candidates, lovedTitles, dislikedTitles] = await Promise.all([
      buildCandidatePool(seeds, exclusionSet, language),
      Promise.all(
        lovedItems.map(async item => ({
          title: await fetchItemTitle(item.tmdbId, item.mediaType, language),
          rating: toRating(item.avgRating),
        }))
      ),
      Promise.all(
        dislikedItems.map(async item => ({
          title: await fetchItemTitle(item.tmdbId, item.mediaType, language),
          rating: toRating(item.avgRating),
        }))
      ),
    ])

    // Update isAnimeFan from candidate pool (carries over to cold start fallback)
    isAnimeFan =
      isAnimeFan || detectIsAnimeFanFromCandidates(candidates, preferredGenres)

    if (candidates.length < 3) {
      // Try to detect anime from watched TV items via TMDB details
      if (!isAnimeFan) {
        isAnimeFan = await detectIsAnimeFanFromWatched(tvSeeds, language)
      }
      console.log(
        '[ai-recommendations] candidate pool too small, falling back to cold start',
        { candidates: candidates.length, isAnimeFan }
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
            genres: c.genres.length > 0 ? c.genres.join(', ') : undefined,
            tmdbId: c.tmdbId,
          })
        )
        .join('\n')

      try {
        const raw = await aiService.generateJSON({
          system: SYSTEM_PROMPT,
          user: buildStandardPrompt({
            watchedCount,
            preferredGenres,
            lovedLine,
            dislikedLine,
            candidateList,
            isAnimeFan,
            language,
          }),
          temperature: 0.5,
          maxTokens: 600,
        })

        const parsed: Rec[] = JSON.parse(raw)

        console.log(
          '[ai-recommendations] standard path raw count',
          parsed.length,
          {
            candidates: candidates.length,
            isAnimeFan,
            lovedCount: lovedTitles.filter(r => r.title).length,
            dislikedCount: dislikedTitles.filter(r => r.title).length,
          }
        )

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
              rec.tmdbId && !exclusionSet.has(`${rec.tmdbId}-${rec.mediaType}`)
          )
      } catch (err) {
        console.error(
          '[ai-recommendations] error (standard):',
          err instanceof Error ? err.message : err
        )
        recommendations = []
      }
    }
  } else if (!isAnimeFan && watchedWithRatings.length > 0) {
    // Pure cold start: detect anime from watched TV items via TMDB details
    isAnimeFan = await detectIsAnimeFanFromWatched(watchedWithRatings, language)
  }

  if (recommendations.length === 0) {
    const movieCount = watchedWithRatings.filter(
      r => r.mediaType === 'MOVIE'
    ).length
    const seriesCount = watchedWithRatings.filter(
      r => r.mediaType === 'TV_SHOW'
    ).length

    try {
      const raw = await aiService.generateJSON({
        system: SYSTEM_PROMPT,
        user: buildColdStartPrompt({
          movieCount,
          seriesCount,
          preferredGenres,
          isAnimeFan,
          language,
        }),
        temperature: 0.6,
        maxTokens: 400,
      })

      const parsed: Array<Omit<Rec, 'tmdbId'>> = JSON.parse(raw)

      console.log(
        '[ai-recommendations] cold start raw count',
        parsed.length,
        parsed.map(r => r.title)
      )

      const resolved = await Promise.all(
        parsed.map(rec =>
          resolveTmdbId(
            { ...rec, mediaType: rec.mediaType === 'tv' ? 'tv' : 'movie' },
            exclusionSet,
            language
          )
        )
      )

      recommendations = resolved.filter((r): r is Rec => r !== null)
    } catch (err) {
      console.error(
        '[ai-recommendations] error (cold start):',
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
