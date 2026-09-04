import { TogetherRoomNotFoundError } from '@/domain/errors/together-room-not-found-error'
import {
  selectTogetherParticipantByTokenHash,
  selectTogetherParticipantsByRoomId,
  selectTogetherRoomByCode,
  selectTogetherSwipeIdsByParticipant,
} from '@/infra/db/repositories/together-repository'
import { hashTogetherToken } from './together-token'

export async function getTogetherRoomService(input: {
  code: string
  participantToken?: string | null
}) {
  const room = await selectTogetherRoomByCode(input.code)
  if (!room) {
    return new TogetherRoomNotFoundError()
  }

  const participants = await selectTogetherParticipantsByRoomId(room.id)
  const emptySwipes = [] as { tmdbId: number; mediaType: string }[]

  if (!input.participantToken) {
    return {
      room,
      participants,
      me: null,
      swipedIds: emptySwipes,
    }
  }

  const me = await selectTogetherParticipantByTokenHash(
    hashTogetherToken(input.participantToken)
  )
  if (!me || me.roomId !== room.id) {
    return {
      room,
      participants,
      me: null,
      swipedIds: emptySwipes,
    }
  }

  const swipedIds = await selectTogetherSwipeIdsByParticipant(me.id)

  return {
    room,
    participants,
    me: {
      id: me.id,
      displayName: me.displayName,
    },
    swipedIds,
  }
}
