import { TogetherInvalidInputError } from '@/domain/errors/together-invalid-input-error'
import { TogetherRoomNotFoundError } from '@/domain/errors/together-room-not-found-error'
import {
  insertTogetherParticipantWithinCapacity,
  selectTogetherParticipantByTokenHash,
  selectTogetherRoomByCode,
} from '@/infra/db/repositories/together-repository'
import { MAX_TOGETHER_PARTICIPANTS } from './constants'
import { createTogetherToken, hashTogetherToken } from './together-token'

export type JoinTogetherRoomInput = {
  code: string
  displayName: string
  participantToken?: string | null
  userId?: string | null
}

export async function joinTogetherRoomService(input: JoinTogetherRoomInput) {
  const room = await selectTogetherRoomByCode(input.code)
  if (!room) {
    return new TogetherRoomNotFoundError()
  }

  if (input.participantToken) {
    const existing = await selectTogetherParticipantByTokenHash(
      hashTogetherToken(input.participantToken)
    )
    if (existing && existing.roomId === room.id) {
      return {
        room,
        participant: existing,
        participantToken: input.participantToken,
      }
    }
  }

  const displayName = input.displayName.trim()
  if (!displayName) {
    return new TogetherInvalidInputError('Display name is required.')
  }

  const participantToken = createTogetherToken()
  const participant = await insertTogetherParticipantWithinCapacity(
    {
      roomId: room.id,
      displayName,
      tokenHash: hashTogetherToken(participantToken),
      userId: input.userId ?? null,
    },
    MAX_TOGETHER_PARTICIPANTS
  )
  if (!participant) {
    return new TogetherInvalidInputError('Room is full.')
  }

  return { room, participant, participantToken }
}
