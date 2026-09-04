import { describe, expect, it } from 'vitest'
import { TogetherInvalidInputError } from '@/domain/errors/together-invalid-input-error'
import { createTogetherRoomService } from './create-room'

describe('create together room', () => {
  it('should create a room with a host participant and token', async () => {
    const sut = await createTogetherRoomService({
      displayName: 'Henrique',
      watchProviderIds: [8, 119],
      watchRegion: 'BR',
      maxRuntime: 90,
      mood: 'SUSPENSE',
    })

    expect(sut).toEqual({
      room: expect.objectContaining({
        code: expect.stringMatching(/^[A-Z2-9]{6}$/),
        watchRegion: 'BR',
        maxRuntime: 90,
        mood: 'SUSPENSE',
      }),
      participant: expect.objectContaining({
        displayName: 'Henrique',
      }),
      participantToken: expect.any(String),
    })

    if (!('participantToken' in sut)) throw new Error('expected room')
    expect(sut.participantToken).toHaveLength(64)
  })

  it('should reject an empty display name', async () => {
    const sut = await createTogetherRoomService({
      displayName: '   ',
    })

    expect(sut).toBeInstanceOf(TogetherInvalidInputError)
  })
})
