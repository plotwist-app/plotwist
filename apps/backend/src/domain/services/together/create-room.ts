import { TogetherInvalidInputError } from '@/domain/errors/together-invalid-input-error'
import { insertTogetherRoomWithHost } from '@/infra/db/repositories/together-repository'
import {
  createTogetherToken,
  generateRoomCode,
  hashTogetherToken,
} from './together-token'

export type CreateTogetherRoomInput = {
  displayName: string
  watchProviderIds?: number[]
  watchRegion?: string
  maxRuntime?: number | null
  mood?: 'FUN' | 'SUSPENSE' | 'COMFORT' | 'ANY'
  hostUserId?: string | null
}

export async function createTogetherRoomService(
  input: CreateTogetherRoomInput
) {
  const displayName = input.displayName.trim()
  if (!displayName) {
    return new TogetherInvalidInputError('Display name is required.')
  }

  const participantToken = createTogetherToken()
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateRoomCode()
    const created = await insertTogetherRoomWithHost(
      {
        code,
        hostUserId: input.hostUserId ?? null,
        watchProviderIds: input.watchProviderIds ?? [],
        watchRegion: input.watchRegion ?? 'BR',
        maxRuntime: input.maxRuntime ?? null,
        mood: input.mood ?? 'ANY',
      },
      {
        displayName,
        tokenHash: hashTogetherToken(participantToken),
        userId: input.hostUserId ?? null,
      }
    )
    if (created) {
      return { ...created, participantToken }
    }
  }

  return new TogetherInvalidInputError('Could not create a unique room code.')
}
