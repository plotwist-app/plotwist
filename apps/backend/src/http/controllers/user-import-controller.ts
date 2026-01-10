import type { FastifyReply, FastifyRequest } from 'fastify'
import { providerDispatcher } from '@/domain/dispatchers/import-dispatcher'
import { DomainError } from '@/domain/errors/domain-error'
import { getDetailedUserImportById } from '@/domain/services/imports/get-detailed-user-import-by-id'
import { publishToQueue } from '@/domain/services/imports/publish-import-to-queue'
import {
  createImportRequestSchema,
  getDetailedImportRequestSchema,
} from '../schemas/imports'

const MAXIMUM_FILE_SIZE_IN_BYTES = 1024 * 1024 * 4 // 4mb

export async function createImportController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { provider } = createImportRequestSchema.parse(request.query)

  const uploadedFile = await request.file({
    limits: { fileSize: MAXIMUM_FILE_SIZE_IN_BYTES },
  })

  const userId = request.user.id

  if (!uploadedFile) {
    return reply.status(400).send({ message: 'Invalid file provided.' })
  }

  try {
    const result = await providerDispatcher(userId, provider, uploadedFile)

    if (result instanceof DomainError) {
      return reply.status(result.status).send({ message: result.message })
    }

    publishToQueue(result)

    return reply.status(200).send({ message: 'File processed successfully.' })
  } catch (error) {
    return reply.status(500).send({
      message: `An error occurred while processing the file: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

export async function getDetailedImportController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { importId } = getDetailedImportRequestSchema.parse(request.params)
  const result = await getDetailedUserImportById(importId)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}
