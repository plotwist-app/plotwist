import type { FastifyInstance } from 'fastify'
import https from 'https'

import { config } from '@/config'
import { withTracing } from '@/infra/telemetry/with-tracing'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// TTL constants (in seconds)
const THIRTY_DAYS = 30 * 24 * 60 * 60
const SEVEN_DAYS = 7 * 24 * 60 * 60
const SIX_HOURS = 6 * 60 * 60
const ONE_HOUR = 60 * 60

const TMDB_PROXY_TAGS = ['TMDB Proxy']

const httpsAgent = new https.Agent({ family: 4, keepAlive: true })

/**
 * Determines cache TTL based on the TMDB endpoint path.
 *
 * - Details (movie/{id}, tv/{id}): 30 days (rarely change)
 * - Images, watch providers, collection: 7 days
 * - Lists (popular, trending, now_playing, etc.): 6 hours
 * - Search: 1 hour
 * - Discover: 6 hours
 */
function getCacheTTL(path: string): number {
  // Movie or TV details: /movie/123, /tv/456
  if (/^(movie|tv)\/\d+$/.test(path)) {
    return THIRTY_DAYS
  }

  // Season details: /tv/123/season/1
  if (/^tv\/\d+\/season\/\d+$/.test(path)) {
    return SEVEN_DAYS
  }

  // Images: /movie/123/images, /tv/456/images
  if (/\/(images|watch\/providers)$/.test(path)) {
    return SEVEN_DAYS
  }

  // Collection details: /collection/123
  if (/^collection\/\d+$/.test(path)) {
    return SEVEN_DAYS
  }

  // Recommendations/similar: /movie/123/recommendations
  if (/\/(recommendations|similar)$/.test(path)) {
    return SEVEN_DAYS
  }

  // Search endpoints
  if (path.startsWith('search/')) {
    return ONE_HOUR
  }

  // Watch provider lists: /watch/providers/regions, /watch/providers/movie
  if (path.startsWith('watch/providers')) {
    return SEVEN_DAYS
  }

  // Everything else (popular, trending, discover, now_playing, etc.)
  return SIX_HOURS
}

/**
 * Builds a deterministic cache key from the TMDB path and sorted query params.
 */
function buildCacheKey(path: string, query: Record<string, string>): string {
  const sortedParams = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&')

  return `tmdb-proxy:${path}${sortedParams ? `:${sortedParams}` : ''}`
}

export async function tmdbProxyRoutes(app: FastifyInstance) {
  app.after(() =>
    app.route({
      method: 'GET',
      url: '/tmdb/*',
      schema: {
        description: 'Proxy TMDB API requests with Redis caching',
        tags: TMDB_PROXY_TAGS,
        hide: config.app.APP_ENV === 'production',
      },
      handler: withTracing('tmdb-proxy', async (request, reply) => {
        const tmdbPath = (request.params as { '*': string })['*']

        if (!tmdbPath) {
          return reply.status(400).send({ error: 'Missing TMDB path' })
        }

        const queryParams = request.query as Record<string, string>
        const cacheKey = buildCacheKey(tmdbPath, queryParams)

        // 1. Check Redis cache
        const cached = await app.redis.get(cacheKey)

        if (cached) {
          reply.header('X-Cache', 'HIT')
          reply.header('Content-Type', 'application/json')
          return reply.send(JSON.parse(cached))
        }

        // 2. Build TMDB URL
        const searchParams = new URLSearchParams(queryParams).toString()
        const tmdbUrl = `${TMDB_BASE_URL}/${tmdbPath}${searchParams ? `?${searchParams}` : ''}`

        // 3. Fetch from TMDB
        const tmdbResponse = await new Promise<{
          statusCode: number
          body: string
        }>((resolve, reject) => {
          const req = https.get(
            tmdbUrl,
            {
              agent: httpsAgent,
              headers: {
                Authorization: `Bearer ${config.services.TMDB_ACCESS_TOKEN}`,
                Accept: 'application/json',
              },
            },
            res => {
              let body = ''
              res.on('data', chunk => {
                body += chunk
              })
              res.on('end', () => {
                resolve({ statusCode: res.statusCode ?? 500, body })
              })
            }
          )
          req.on('error', reject)
          req.end()
        })

        // 4. Handle TMDB errors
        if (tmdbResponse.statusCode !== 200) {
          return reply.status(tmdbResponse.statusCode).send({
            error: 'TMDB API error',
            statusCode: tmdbResponse.statusCode,
          })
        }

        // 5. Cache the response
        const ttl = getCacheTTL(tmdbPath)
        await app.redis.set(cacheKey, tmdbResponse.body, 'EX', ttl)

        // 6. Return response
        reply.header('X-Cache', 'MISS')
        reply.header('Content-Type', 'application/json')
        return reply.send(JSON.parse(tmdbResponse.body))
      }),
    })
  )
}
