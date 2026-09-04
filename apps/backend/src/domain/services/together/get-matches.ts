import { TogetherRoomNotFoundError } from '@/domain/errors/together-room-not-found-error'
import { TogetherUnauthorizedError } from '@/domain/errors/together-unauthorized-error'
import {
  selectTogetherMatches,
  selectTogetherParticipantByTokenHash,
  selectTogetherParticipantsByRoomId,
  selectTogetherRoomByCode,
} from '@/infra/db/repositories/together-repository'
import { hashTogetherToken } from './together-token'

export async function getTogetherMatchesService(input: {
  code: string
  participantToken: string
}) {
  const room = await selectTogetherRoomByCode(input.code)
  if (!room) {
    return new TogetherRoomNotFoundError()
  }

  const me = await selectTogetherParticipantByTokenHash(
    hashTogetherToken(input.participantToken)
  )
  if (!me || me.roomId !== room.id) {
    return new TogetherUnauthorizedError()
  }

  const participants = await selectTogetherParticipantsByRoomId(room.id)
  const matches = await selectTogetherMatches(room.id)

  return {
    matches: matches.map((match, index) => ({
      ...match,
      matchPercent: participants.length
        ? Math.round((match.interestCount / participants.length) * 100)
        : 0,
      highlighted: index === 0,
    })),
  }
}
