import { describe, expect, it } from 'vitest'
import { TogetherInvalidInputError } from '@/domain/errors/together-invalid-input-error'
import { TogetherRoomNotFoundError } from '@/domain/errors/together-room-not-found-error'
import { createTogetherRoomService } from './create-room'
import { joinTogetherRoomService } from './join-room'

describe('join together room', () => {
  it('should add a second participant to an existing room', async () => {
    const created = await createTogetherRoomService({
      displayName: 'Henrique',
    })
    if (!('room' in created)) throw new Error('expected room')

    const sut = await joinTogetherRoomService({
      code: created.room.code,
      displayName: 'Maria',
    })

    expect(sut).toEqual({
      room: expect.objectContaining({ id: created.room.id }),
      participant: expect.objectContaining({ displayName: 'Maria' }),
      participantToken: expect.any(String),
    })
  })

  it('should rejoin with the same token without creating a new participant', async () => {
    const created = await createTogetherRoomService({
      displayName: 'Henrique',
    })
    if (!('room' in created)) throw new Error('expected room')

    const sut = await joinTogetherRoomService({
      code: created.room.code,
      displayName: 'Someone else',
      participantToken: created.participantToken,
    })

    expect(sut).toEqual({
      room: expect.objectContaining({ id: created.room.id }),
      participant: expect.objectContaining({
        id: created.participant.id,
        displayName: 'Henrique',
      }),
      participantToken: created.participantToken,
    })
  })

  it('should not join a missing room', async () => {
    const sut = await joinTogetherRoomService({
      code: 'ZZZZZZ',
      displayName: 'Maria',
    })

    expect(sut).toBeInstanceOf(TogetherRoomNotFoundError)
  })

  it('should require a name when joining without a token', async () => {
    const created = await createTogetherRoomService({
      displayName: 'Henrique',
    })
    if (!('room' in created)) throw new Error('expected room')

    const sut = await joinTogetherRoomService({
      code: created.room.code,
      displayName: ' ',
    })

    expect(sut).toBeInstanceOf(TogetherInvalidInputError)
  })

  it('should reject a fifth participant while allowing an existing participant to rejoin', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Maria',
    })
    await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'João',
    })
    const fourth = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Ana',
    })
    if (!('participantToken' in fourth)) throw new Error('expected join')

    const fifth = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Lucas',
    })
    const rejoined = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Ignored',
      participantToken: fourth.participantToken,
    })

    expect(fifth).toBeInstanceOf(TogetherInvalidInputError)
    expect(rejoined).toEqual(
      expect.objectContaining({
        participant: expect.objectContaining({ id: fourth.participant.id }),
        participantToken: fourth.participantToken,
      })
    )
  })
})
