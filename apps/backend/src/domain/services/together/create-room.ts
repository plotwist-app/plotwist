import { TogetherInvalidInputError } from '@/domain/errors/together-invalid-input-error'
import {
  insertTogetherParticipant,
  insertTogetherRoom,
  selectTogetherRoomByCode,
} from '@/infra/db/repositories/together-repository'
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

  let room = null
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateRoomCode()
    const existing = await selectTogetherRoomByCode(code)
    if (existing) continue

    room = await insertTogetherRoom({
      code,
      hostUserId: input.hostUserId ?? null,
      watchProviderIds: input.watchProviderIds ?? [],
      watchRegion: input.watchRegion ?? 'BR',
      maxRuntime: input.maxRuntime ?? null,
      mood: input.mood ?? 'ANY',
    })
    break
  }

  if (!room) {
    return new TogetherInvalidInputError('Could not create a unique room code.')
  }

  const participantToken = createTogetherToken()
  const participant = await insertTogetherParticipant({
    roomId: room.id,
    displayName,
    tokenHash: hashTogetherToken(participantToken),
    userId: input.hostUserId ?? null,
  })

  return { room, participant, participantToken }
}
