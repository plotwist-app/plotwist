import { TogetherRoomNotFoundError } from '@/domain/errors/together-room-not-found-error'
import { TogetherUnauthorizedError } from '@/domain/errors/together-unauthorized-error'
import {
  selectTogetherMatch,
  selectTogetherParticipantByTokenHash,
  selectTogetherParticipantsByRoomId,
  selectTogetherRoomByCode,
  upsertTogetherSwipe,
} from '@/infra/db/repositories/together-repository'
import { hashTogetherToken } from './together-token'

export type CreateTogetherSwipeInput = {
  code: string
  participantToken: string
  tmdbId: number
  mediaType: 'MOVIE' | 'TV_SHOW'
  decision: 'LIKE' | 'PASS' | 'MAYBE'
  title: string
  posterPath?: string | null
  voteAverage?: number | null
  releaseDate?: string | null
  overview?: string | null
}

export async function createTogetherSwipeService(
  input: CreateTogetherSwipeInput
) {
  const room = await selectTogetherRoomByCode(input.code)
  if (!room) {
    return new TogetherRoomNotFoundError()
  }

  const participant = await selectTogetherParticipantByTokenHash(
    hashTogetherToken(input.participantToken)
  )
  if (!participant || participant.roomId !== room.id) {
    return new TogetherUnauthorizedError()
  }

  const swipe = await upsertTogetherSwipe({
    roomId: room.id,
    participantId: participant.id,
    tmdbId: input.tmdbId,
    mediaType: input.mediaType,
    decision: input.decision,
    title: input.title,
    posterPath: input.posterPath ?? null,
    voteAverage: input.voteAverage ?? null,
    releaseDate: input.releaseDate ?? null,
    overview: input.overview ?? null,
  })

  const participants = await selectTogetherParticipantsByRoomId(room.id)
  const match =
    input.decision === 'PASS'
      ? null
      : await selectTogetherMatch({
          roomId: room.id,
          tmdbId: input.tmdbId,
          mediaType: input.mediaType,
        })

  const matchPercent = participants.length
    ? Math.round(((match?.interestCount ?? 0) / participants.length) * 100)
    : 0

  return {
    swipe,
    match: match
      ? {
          ...match,
          matchPercent,
        }
      : null,
  }
}
