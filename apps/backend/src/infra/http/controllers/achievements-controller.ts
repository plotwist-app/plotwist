import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import {
  createAchievementAdmin,
  deleteAchievementAdmin,
  getAchievementAdmin,
  listAchievementsAdmin,
  updateAchievementAdmin,
} from '@/domain/services/achievements/admin-crud'
import { claimAchievement } from '@/domain/services/achievements/claim-achievement'
import { getUserAchievements } from '@/domain/services/achievements/get-user-achievements'
import { toggleEquipAchievement } from '@/domain/services/achievements/toggle-equip'
import {
  achievementParamsSchema,
  createAchievementBodySchema,
  toggleEquipBodySchema,
  updateAchievementBodySchema,
} from '../schemas/achievements'

// User controllers

export async function getUserAchievementsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const achievements = await getUserAchievements(request.user.id)
  return reply.status(200).send({ achievements })
}

export async function claimAchievementController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = achievementParamsSchema.parse(request.params)
  const result = await claimAchievement(request.user.id, id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}

export async function toggleEquipController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = achievementParamsSchema.parse(request.params)
  const { isEquipped } = toggleEquipBodySchema.parse(request.body)
  const result = await toggleEquipAchievement(request.user.id, id, isEquipped)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}

// Admin controllers

export async function adminListAchievementsController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const achievements = await listAchievementsAdmin()
  return reply.status(200).send({ achievements })
}

export async function adminGetAchievementController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = achievementParamsSchema.parse(request.params)
  const result = await getAchievementAdmin(id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ achievement: result })
}

export async function adminCreateAchievementController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createAchievementBodySchema.parse(request.body)
  const result = await createAchievementAdmin(body)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(201).send(result)
}

export async function adminUpdateAchievementController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = achievementParamsSchema.parse(request.params)
  const body = updateAchievementBodySchema.parse(request.body)
  const result = await updateAchievementAdmin(id, body)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}

export async function adminDeleteAchievementController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = achievementParamsSchema.parse(request.params)
  const result = await deleteAchievementAdmin(id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}
