import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { GetUserActivitiesResponseType } from '@/http/schemas/user-activities'
import { getTMDBDataService } from '../tmdb/get-tmdb-data'

export type FormatUserActivitiesInput = {
  redis: FastifyRedis
  language: Language
  userActivities: GetUserActivitiesResponseType['userActivities']
}

export async function formatUserActivitiesService({
  userActivities,
  redis,
  language,
}: FormatUserActivitiesInput) {
  const formatted = await Promise.all(
    userActivities.map(async activity => {
      try {
        if (
          activity.activityType === 'ADD_ITEM' ||
          activity.activityType === 'DELETE_ITEM' ||
          activity.activityType === 'CHANGE_STATUS' ||
          activity.activityType === 'CREATE_REVIEW' ||
          activity.activityType === 'LIKE_REVIEW'
        ) {
          const { mediaType, tmdbId } = activity.additionalInfo

          const { title } = await getTMDBDataService(redis, {
            language,
            mediaType,
            tmdbId,
          })

          return {
            ...activity,
            additionalInfo: {
              ...activity.additionalInfo,
              title,
            },
          }
        }

        if (activity.activityType === 'WATCH_EPISODE') {
          const { episodes } = activity.additionalInfo
          const tmdbId = episodes[0].tmdbId

          const { title } = await getTMDBDataService(redis, {
            language,
            mediaType: 'TV_SHOW',
            tmdbId: tmdbId,
          })

          return {
            ...activity,
            additionalInfo: {
              ...activity.additionalInfo,
              title,
              tmdbId,
            },
          }
        }

        if (
          activity.activityType === 'LIKE_REPLY' ||
          activity.activityType === 'CREATE_REPLY'
        ) {
          const {
            review: { tmdbId, mediaType },
          } = activity.additionalInfo

          const { title } = await getTMDBDataService(redis, {
            language,
            mediaType: mediaType,
            tmdbId: tmdbId,
          })

          return {
            ...activity,
            additionalInfo: {
              ...activity.additionalInfo,
              review: {
                ...activity.additionalInfo.review,
                title,
              },
            },
          }
        }

        return activity
      } catch (error) {
        return activity
      }
    })
  )

  return { userActivities: formatted }
}
