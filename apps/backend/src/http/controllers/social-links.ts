import { getSocialLinksService } from '@/domain/services/social-links/get-social-links'
import { upsertSocialLinksService } from '@/domain/services/social-links/upsert-social-links'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  getSocialLinksQuerySchema,
  socialLinksBodySchema,
} from '../schemas/social-links'

export async function upsertSocialLinksController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const socialLinks = socialLinksBodySchema.parse(request.body)

  await upsertSocialLinksService({
    values: socialLinks,
    userId: request.user.id,
  })

  return reply.status(204).send()
}

export async function getSocialLinksController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = getSocialLinksQuerySchema.parse(request.query)

  const result = await getSocialLinksService({ userId })

  return reply.status(200).send({ socialLinks: result.socialLinks })
}
