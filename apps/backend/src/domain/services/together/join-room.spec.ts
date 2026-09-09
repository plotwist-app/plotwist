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

  it('should allow 20 distinct participants, reject participant 21, and allow rejoining when full', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    const joins = []
    for (let index = 2; index <= 20; index += 1) {
      joins.push(
        await joinTogetherRoomService({
          code: host.room.code,
          displayName: `Participant ${index}`,
        })
      )
    }
    const twentieth = joins.at(-1)
    if (!twentieth || !('participantToken' in twentieth)) {
      throw new Error('expected twentieth participant to join')
    }

    const twentyFirst = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Participant 21',
    })
    const rejoined = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Ignored',
      participantToken: twentieth.participantToken,
    })

    expect(joins).toHaveLength(19)
    expect(joins.every(result => 'participantToken' in result)).toBe(true)
    expect(twentyFirst).toBeInstanceOf(TogetherInvalidInputError)
    expect(rejoined).toEqual(
      expect.objectContaining({
        participant: expect.objectContaining({ id: twentieth.participant.id }),
        participantToken: twentieth.participantToken,
      })
    )
  })

  it('should allow only one of two concurrent joins when one place remains', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    for (let index = 2; index <= 19; index += 1) {
      await joinTogetherRoomService({
        code: host.room.code,
        displayName: `Participant ${index}`,
      })
    }

    const results = await Promise.all([
      joinTogetherRoomService({
        code: host.room.code,
        displayName: 'Ana',
      }),
      joinTogetherRoomService({
        code: host.room.code,
        displayName: 'Lucas',
      }),
    ])

    expect(
      results.filter(result => result instanceof TogetherInvalidInputError)
    ).toHaveLength(1)
    expect(results.filter(result => 'participantToken' in result)).toHaveLength(
      1
    )
  })
})
