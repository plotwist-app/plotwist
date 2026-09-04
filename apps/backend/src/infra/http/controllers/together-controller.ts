import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  TogetherParticipant,
  TogetherRoom,
} from '@/domain/entities/together'
import { DomainError } from '@/domain/errors/domain-error'
import { createTogetherRoomService } from '@/domain/services/together/create-room'
import { createTogetherSwipeService } from '@/domain/services/together/create-swipe'
import { getTogetherMatchesService } from '@/domain/services/together/get-matches'
import { getTogetherRoomService } from '@/domain/services/together/get-room'
import { joinTogetherRoomService } from '@/domain/services/together/join-room'
import {
  createTogetherRoomBodySchema,
  createTogetherSwipeBodySchema,
  joinTogetherRoomBodySchema,
  togetherCodeParamsSchema,
} from '../schemas/together'

function togetherTokenFrom(request: FastifyRequest) {
  const header = request.headers['x-together-token']
  return typeof header === 'string' && header.length > 0 ? header : null
}

function asIso(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString()
}

function serializeRoom(room: TogetherRoom) {
  return {
    id: room.id,
    code: room.code,
    watchProviderIds: room.watchProviderIds ?? [],
    watchRegion: room.watchRegion,
    maxRuntime: room.maxRuntime,
    mood: room.mood,
    createdAt: asIso(room.createdAt),
  }
}

function serializeParticipant(
  participant: Pick<TogetherParticipant, 'id' | 'displayName'> &
    Partial<Pick<TogetherParticipant, 'userId' | 'createdAt'>>
) {
  return {
    id: participant.id,
    displayName: participant.displayName,
    userId: participant.userId ?? null,
    createdAt: participant.createdAt ? asIso(participant.createdAt) : undefined,
  }
}

function serializeSession(result: {
  room: TogetherRoom
  participant: TogetherParticipant
  participantToken: string
}) {
  return {
    room: serializeRoom(result.room),
    participant: serializeParticipant(result.participant),
    participantToken: result.participantToken,
  }
}

export async function createTogetherRoomController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createTogetherRoomBodySchema.parse(request.body)
  const result = await createTogetherRoomService({
    ...body,
    hostUserId: request.user?.id ?? null,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(201).send(serializeSession(result))
}

export async function joinTogetherRoomController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { code } = togetherCodeParamsSchema.parse(request.params)
  const body = joinTogetherRoomBodySchema.parse(request.body ?? {})
  const result = await joinTogetherRoomService({
    code,
    displayName: body.displayName ?? '',
    participantToken: togetherTokenFrom(request),
    userId: request.user?.id ?? null,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(serializeSession(result))
}

export async function getTogetherRoomController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { code } = togetherCodeParamsSchema.parse(request.params)
  const result = await getTogetherRoomService({
    code,
    participantToken: togetherTokenFrom(request),
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({
    room: serializeRoom(result.room),
    participants: result.participants.map(serializeParticipant),
    me: result.me,
    swipedIds: result.swipedIds,
  })
}

export async function createTogetherSwipeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { code } = togetherCodeParamsSchema.parse(request.params)
  const body = createTogetherSwipeBodySchema.parse(request.body)
  const token = togetherTokenFrom(request)

  if (!token) {
    return reply.status(401).send({ message: 'Together token is required.' })
  }

  const result = await createTogetherSwipeService({
    code,
    participantToken: token,
    ...body,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({
    swipe: {
      id: result.swipe.id,
      tmdbId: result.swipe.tmdbId,
      mediaType: result.swipe.mediaType,
      decision: result.swipe.decision,
      title: result.swipe.title,
    },
    match: result.match,
  })
}

export async function getTogetherMatchesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { code } = togetherCodeParamsSchema.parse(request.params)
  const token = togetherTokenFrom(request)

  if (!token) {
    return reply.status(401).send({ message: 'Together token is required.' })
  }

  const result = await getTogetherMatchesService({
    code,
    participantToken: token,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}
