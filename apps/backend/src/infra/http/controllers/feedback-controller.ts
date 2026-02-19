import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import { createFeedbackService } from '@/domain/services/feedback/create-feedback'
import { createFeedbackBodySchema } from '../schemas/feedback'

export async function createFeedbackController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createFeedbackBodySchema.parse(request.body)

  const result = await createFeedbackService({
    ...body,
    userId: request.user.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(201).send({ feedback: result.feedback })
}
