import type { FastifyReply, FastifyRequest } from 'fastify'

import { DomainError } from '@/domain/errors/domain-error'
import { createReviewReplyService } from '@/domain/services/review-replies/create-review-reply'
import { deleteReviewReply } from '@/domain/services/review-replies/delete-review-reply'
import { getReviewRepliesService } from '@/domain/services/review-replies/get-review-replies'
import { updateReviewReply } from '@/domain/services/review-replies/update-review-reply'
import { deleteUserActivityByEntityService } from '@/domain/services/user-activities/delete-user-activity'
import {
  createReviewReplyBodySchema,
  deleteReviewReplyParamsSchema,
  getReviewRepliesQuerySchema,
  updateReviewReplyBodySchema,
  updateReviewReplyParamsSchema,
} from '../schemas/review-replies'

export async function createReviewReplyController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createReviewReplyBodySchema.parse(request.body)
  const result = await createReviewReplyService({
    ...body,
    userId: request.user.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(201).send({ reviewReply: result.reviewReply })
}

export async function updateReviewReplyController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { reply: updateReply } = updateReviewReplyBodySchema.parse(request.body)
  const { id } = updateReviewReplyParamsSchema.parse(request.params)

  const result = await updateReviewReply(id, updateReply)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ reviewReply: result.reviewReply })
}

export async function deleteReviewReplyController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = deleteReviewReplyParamsSchema.parse(request.params)
  const result = await deleteReviewReply(id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  await deleteUserActivityByEntityService({
    activityType: 'CREATE_REPLY',
    entityType: 'REPLY',
    entityId: id,
    userId: result.reviewReply.userId,
  })

  return reply.status(204).send()
}

export async function getReviewRepliesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { reviewId } = getReviewRepliesQuerySchema.parse(request.query)
  const result = await getReviewRepliesService(reviewId, request.user?.id)

  return reply.status(200).send(result.reviewReplies)
}
