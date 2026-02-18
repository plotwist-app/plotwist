import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema, statusEnum } from '@/db/schema'

export const getUserDefaultSchema = z.object({
  id: z.string(),
})

export const getUserStatsResponseSchema = {
  200: z.object({
    followersCount: z.number(),
    followingCount: z.number(),
    watchedMoviesCount: z.number(),
    watchedSeriesCount: z.number(),
  }),
}

export const getUserTotalHoursResponseSchema = {
  200: z.object({
    totalHours: z.number(),
    movieHours: z.number(),
    seriesHours: z.number(),
    monthlyHours: z.array(
      z.object({
        month: z.string(),
        hours: z.number(),
      })
    ),
  }),
}

export const getUserReviewsCountResponseSchema = {
  200: z.object({
    reviewsCount: z.number(),
  }),
}

export const getUserMostWatchedSeriesResponseSchema = {
  200: z.object({
    mostWatchedSeries: z.array(
      z.object({
        id: z.number(),
        episodes: z.number(),
        title: z.string(),
        posterPath: z.string().nullable(),
        backdropPath: z.string().nullable(),
      })
    ),
  }),
}

export const getUserWatchedGenresResponseSchema = {
  200: z.object({
    genres: z.array(
      z.object({
        name: z.string(),
        count: z.number(),
        percentage: z.number(),
        posterPath: z.string().nullable(),
        posterPaths: z.array(z.string()).optional(),
        items: z
          .array(
            z.object({
              tmdbId: z.number(),
              mediaType: z.string(),
              posterPath: z.string().nullable(),
            })
          )
          .optional(),
      })
    ),
  }),
}

export const getUserWatchedCastResponseSchema = {
  200: z.object({
    watchedCast: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        count: z.number(),
        percentage: z.number(),
        profilePath: z.string().nullable(),
      })
    ),
  }),
}

export const getUserWatchedCountriesResponseSchema = {
  200: z.object({
    watchedCountries: z.array(
      z.object({
        name: z.string(),
        count: z.number(),
        percentage: z.number(),
      })
    ),
  }),
}

export const getUserBestReviewsResponseSchema = {
  200: z.object({
    bestReviews: z.array(
      createSelectSchema(schema.reviews).extend({
        title: z.string(),
        posterPath: z.string().nullable(),
        date: z.string().nullable(),
      })
    ),
  }),
}

export const getUserItemsStatusResponseSchema = {
  200: z.object({
    userItems: z.array(
      z.object({
        status: z.enum(statusEnum.enumValues),
        count: z.number(),
        percentage: z.number(),
      })
    ),
  }),
}

export const getUserStatsTimelineResponseSchema = {
  200: z.object({
    sections: z.array(
      z.object({
        yearMonth: z.string(),
        totalHours: z.number(),
        movieHours: z.number(),
        seriesHours: z.number(),
        topGenre: z
          .object({
            name: z.string(),
            posterPath: z.string().nullable(),
          })
          .nullable(),
        topReview: z
          .object({
            title: z.string(),
            posterPath: z.string().nullable(),
            rating: z.number(),
          })
          .nullable(),
      })
    ),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  }),
}
