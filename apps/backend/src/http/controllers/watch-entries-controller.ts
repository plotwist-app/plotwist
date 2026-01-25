import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createWatchEntry,
  deleteWatchEntry,
  getWatchEntriesByUserItemId,
  updateWatchEntry,
} from '@/db/repositories/user-watch-entries-repository'
import {
  createWatchEntryBodySchema,
  deleteWatchEntryParamsSchema,
  getWatchEntriesQuerySchema,
  updateWatchEntryBodySchema,
  updateWatchEntryParamsSchema,
} from '../schemas/watch-entries'

export async function createWatchEntryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userItemId, watchedAt } = createWatchEntryBodySchema.parse(
    request.body
  )

  const entry = await createWatchEntry({
    userItemId,
    watchedAt: watchedAt ? new Date(watchedAt) : undefined,
  })

  return reply.status(201).send({
    watchEntry: {
      ...entry,
      watchedAt: entry.watchedAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    },
  })
}

export async function getWatchEntriesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userItemId } = getWatchEntriesQuerySchema.parse(request.query)

  const entries = await getWatchEntriesByUserItemId(userItemId)

  return reply.status(200).send({
    watchEntries: entries.map(entry => ({
      ...entry,
      watchedAt: entry.watchedAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    })),
  })
}

export async function updateWatchEntryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = updateWatchEntryParamsSchema.parse(request.params)
  const { watchedAt } = updateWatchEntryBodySchema.parse(request.body)

  const entry = await updateWatchEntry(id, new Date(watchedAt))

  if (!entry) {
    return reply.status(404).send({ message: 'Watch entry not found' })
  }

  return reply.status(200).send({
    watchEntry: {
      ...entry,
      watchedAt: entry.watchedAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    },
  })
}

export async function deleteWatchEntryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = deleteWatchEntryParamsSchema.parse(request.params)

  const entry = await deleteWatchEntry(id)

  if (!entry) {
    return reply.status(404).send({ message: 'Watch entry not found' })
  }

  return reply.status(204).send()
}
