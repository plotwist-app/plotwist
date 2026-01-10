import { deleteUserActivityByIdService } from '@/domain/services/user-activities/delete-user-activity'
import { formatUserActivitiesService } from '@/domain/services/user-activities/format-user-activities'
import { getUserActivitiesService } from '@/domain/services/user-activities/get-user-activities'
import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  type GetUserActivitiesResponseType,
  deleteUserActivityParamsSchema,
  getUserActivitiesParamsSchema,
  getUserActivitiesQuerySchema,
  getUserNetworkActivitiesQuerySchema,
} from '../schemas/user-activities'

import { getUserNetworkActivitiesService } from '@/domain/services/user-activities/get-network-activities'

export async function getUserActivitiesController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { userId } = getUserActivitiesParamsSchema.parse(request.params)
  const { language, pageSize, cursor } = getUserActivitiesQuerySchema.parse(
    request.query
  )

  const result = (await getUserActivitiesService({
    userIds: [userId],
    cursor,
    pageSize: Number(pageSize),
  })) as GetUserActivitiesResponseType

  const { userActivities } = await formatUserActivitiesService({
    userActivities: result.userActivities,
    language,
    redis,
  })

  return reply.status(200).send({ ...result, userActivities })
}

export async function deleteUserActivityController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { activityId } = deleteUserActivityParamsSchema.parse(request.params)
  await deleteUserActivityByIdService(activityId)

  return reply.status(204).send()
}

export async function getUserNetworkActivitiesController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { userId, cursor, pageSize, language } =
    getUserNetworkActivitiesQuerySchema.parse(request.query)

  const result = (await getUserNetworkActivitiesService({
    userId,
    cursor,
    pageSize: Number(pageSize),
  })) as GetUserActivitiesResponseType

  const { userActivities } = await formatUserActivitiesService({
    userActivities: result.userActivities,
    language,
    redis,
  })

  return reply.status(200).send({ ...result, userActivities })
}
