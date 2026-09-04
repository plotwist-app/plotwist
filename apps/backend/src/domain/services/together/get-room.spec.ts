import { describe, expect, it } from 'vitest'
import { TogetherRoomNotFoundError } from '@/domain/errors/together-room-not-found-error'
import { createTogetherRoomService } from './create-room'
import { getTogetherRoomService } from './get-room'

describe('get together room', () => {
  it('should return the room for guests without a token', async () => {
    const created = await createTogetherRoomService({
      displayName: 'Henrique',
    })
    if (!('room' in created)) throw new Error('expected room')

    const sut = await getTogetherRoomService({
      code: created.room.code,
    })

    expect(sut).toEqual(
      expect.objectContaining({
        me: null,
        participants: [expect.objectContaining({ displayName: 'Henrique' })],
        swipedIds: [],
      })
    )
  })

  it('should treat an invalid token as a guest instead of failing', async () => {
    const created = await createTogetherRoomService({
      displayName: 'Henrique',
    })
    if (!('room' in created)) throw new Error('expected room')

    const sut = await getTogetherRoomService({
      code: created.room.code,
      participantToken: 'a'.repeat(64),
    })

    expect(sut).toEqual(
      expect.objectContaining({
        me: null,
        participants: [expect.objectContaining({ displayName: 'Henrique' })],
      })
    )
  })

  it('should return the participant when the token matches', async () => {
    const created = await createTogetherRoomService({
      displayName: 'Henrique',
    })
    if (!('room' in created)) throw new Error('expected room')

    const sut = await getTogetherRoomService({
      code: created.room.code,
      participantToken: created.participantToken,
    })

    expect(sut).toEqual(
      expect.objectContaining({
        me: expect.objectContaining({
          id: created.participant.id,
          displayName: 'Henrique',
        }),
      })
    )
  })

  it('should not find a missing room', async () => {
    const sut = await getTogetherRoomService({ code: 'ZZZZZZ' })
    expect(sut).toBeInstanceOf(TogetherRoomNotFoundError)
  })
})
