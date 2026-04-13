import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { tmdb } from '@/infra/adapters/tmdb'
import { createAIService } from '@/infra/factories/ai-provider-factory'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { getUserAIRecommendationsService } from './get-user-ai-recommendations'

vi.mock('@/infra/factories/ai-provider-factory')

vi.mock('@/infra/adapters/tmdb', () => ({
  tmdb: {
    movies: {
      related: vi.fn(),
      details: vi.fn(),
    },
    tv: {
      related: vi.fn(),
      details: vi.fn(),
    },
    search: {
      multi: vi.fn(),
    },
  },
}))

const INCEPTION = {
  id: 27205,
  title: 'Inception',
  release_date: '2010-07-16',
  vote_count: 35_000,
}

const BREAKING_BAD = {
  id: 1396,
  name: 'Breaking Bad',
  first_air_date: '2008-01-20',
  vote_count: 15_000,
}

describe('get user ai recommendations', () => {
  let generateJSONMock: Mock

  beforeEach(async () => {
    await redisClient.flushall()

    generateJSONMock = vi.fn()
    ;(createAIService as Mock).mockReturnValue({
      generateMessage: vi.fn(),
      generateJSON: generateJSONMock,
    })

    ;(tmdb.movies.related as Mock).mockResolvedValue({ results: [INCEPTION] })
    ;(tmdb.tv.related as Mock).mockResolvedValue({ results: [BREAKING_BAD] })
    ;(tmdb.movies.details as Mock).mockResolvedValue({ title: INCEPTION.title })
    ;(tmdb.tv.details as Mock).mockResolvedValue({ name: BREAKING_BAD.name })
    ;(tmdb.search.multi as Mock).mockResolvedValue({
      results: [
        {
          id: INCEPTION.id,
          media_type: 'movie',
          vote_count: INCEPTION.vote_count,
          title: INCEPTION.title,
        },
      ],
    })
  })

  describe('cold start (fewer than 5 watched items)', () => {
    it('should return AI-generated recommendations resolved via TMDB search', async () => {
      const user = await makeUser()

      generateJSONMock.mockResolvedValue(
        JSON.stringify([
          {
            title: INCEPTION.title,
            reason: 'A mind-bending sci-fi thriller.',
            mediaType: 'movie',
            year: 2010,
          },
        ])
      )

      const result = await getUserAIRecommendationsService({
        userId: user.id,
        redis: redisClient,
        language: 'en-US',
      })

      expect(generateJSONMock).toHaveBeenCalledOnce()
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0]).toMatchObject({
        title: INCEPTION.title,
        mediaType: 'movie',
        tmdbId: INCEPTION.id,
      })
    })

    it('should return empty recommendations when AI returns no resolvable titles', async () => {
      const user = await makeUser()

      generateJSONMock.mockResolvedValue(JSON.stringify([]))

      const result = await getUserAIRecommendationsService({
        userId: user.id,
        redis: redisClient,
        language: 'en-US',
      })

      expect(result.recommendations).toHaveLength(0)
    })
  })

  describe('standard path (5 or more watched items)', () => {
    it('should use TMDB candidate pool and AI curation', async () => {
      const user = await makeUser()

      for (let i = 0; i < 5; i++) {
        await makeUserItem({
          userId: user.id,
          status: 'WATCHED',
          mediaType: 'MOVIE',
        })
      }

      generateJSONMock.mockResolvedValue(
        JSON.stringify([
          {
            title: INCEPTION.title,
            reason: 'A classic.',
            mediaType: 'movie',
            year: 2010,
            tmdbId: INCEPTION.id,
          },
        ])
      )

      const result = await getUserAIRecommendationsService({
        userId: user.id,
        redis: redisClient,
        language: 'en-US',
      })

      expect(tmdb.movies.related).toHaveBeenCalled()
      expect(generateJSONMock).toHaveBeenCalledOnce()
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0]).toMatchObject({
        title: INCEPTION.title,
        tmdbId: INCEPTION.id,
        mediaType: 'movie',
      })
    })

    it('should include both movie and TV candidates when user has both', async () => {
      const user = await makeUser()

      for (let i = 0; i < 3; i++) {
        await makeUserItem({
          userId: user.id,
          status: 'WATCHED',
          mediaType: 'MOVIE',
        })
      }
      for (let i = 0; i < 3; i++) {
        await makeUserItem({
          userId: user.id,
          status: 'WATCHED',
          mediaType: 'TV_SHOW',
        })
      }
      // Cold start path is triggered when candidate pool < 3 (1 movie + 1 TV = 2)
      // Mock search.multi to resolve both titles correctly
      ;(tmdb.search.multi as Mock).mockImplementation((title: string) => {
        if (title === BREAKING_BAD.name) {
          return Promise.resolve({
            results: [
              {
                id: BREAKING_BAD.id,
                media_type: 'tv',
                vote_count: BREAKING_BAD.vote_count,
                name: BREAKING_BAD.name,
              },
            ],
          })
        }
        return Promise.resolve({
          results: [
            {
              id: INCEPTION.id,
              media_type: 'movie',
              vote_count: INCEPTION.vote_count,
              title: INCEPTION.title,
            },
          ],
        })
      })

      generateJSONMock.mockResolvedValue(
        JSON.stringify([
          {
            title: INCEPTION.title,
            reason: 'Great film.',
            mediaType: 'movie',
            year: 2010,
          },
          {
            title: BREAKING_BAD.name,
            reason: 'Unmissable series.',
            mediaType: 'tv',
            year: 2008,
          },
        ])
      )

      const result = await getUserAIRecommendationsService({
        userId: user.id,
        redis: redisClient,
        language: 'en-US',
      })

      expect(tmdb.movies.related).toHaveBeenCalled()
      expect(tmdb.tv.related).toHaveBeenCalled()
      expect(result.recommendations).toHaveLength(2)
    })
  })

  describe('exclusion', () => {
    it('should not recommend items already in any user list status', async () => {
      const user = await makeUser()

      await makeUserItem({
        userId: user.id,
        tmdbId: INCEPTION.id,
        mediaType: 'MOVIE',
        status: 'WATCHING',
      })

      generateJSONMock.mockResolvedValue(
        JSON.stringify([
          {
            title: INCEPTION.title,
            reason: 'A classic.',
            mediaType: 'movie',
            year: 2010,
          },
        ])
      )

      const result = await getUserAIRecommendationsService({
        userId: user.id,
        redis: redisClient,
        language: 'en-US',
      })

      const hasExcluded = result.recommendations.some(
        (r: { tmdbId?: number }) => r.tmdbId === INCEPTION.id
      )
      expect(hasExcluded).toBe(false)
    })
  })

  describe('caching', () => {
    it('should return cached result on second call without calling AI again', async () => {
      const user = await makeUser()

      generateJSONMock.mockResolvedValue(
        JSON.stringify([
          {
            title: INCEPTION.title,
            reason: 'A classic.',
            mediaType: 'movie',
            year: 2010,
          },
        ])
      )

      const params = {
        userId: user.id,
        redis: redisClient,
        language: 'en-US' as const,
      }

      const first = await getUserAIRecommendationsService(params)
      const second = await getUserAIRecommendationsService(params)

      expect(generateJSONMock).toHaveBeenCalledOnce()
      expect(second).toEqual(first)
    })
  })
})
