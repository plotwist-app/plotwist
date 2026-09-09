import { afterEach, describe, expect, it, vi } from 'vitest'
import { TogetherInvalidInputError } from '@/domain/errors/together-invalid-input-error'
import { selectTogetherRoomByCode } from '@/infra/db/repositories/together-repository'
import { createTogetherRoomService } from './create-room'
import * as togetherToken from './together-token'

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('should roll back the room when creating the host participant fails', async () => {
    vi.spyOn(togetherToken, 'generateRoomCode')
      .mockReturnValueOnce('ATOM01')
      .mockReturnValueOnce('ATOM02')
    vi.spyOn(togetherToken, 'createTogetherToken').mockReturnValue(
      'a'.repeat(64)
    )

    const first = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in first)) throw new Error('expected room')
    expect(first.room.code).toBe('ATOM01')

    await expect(
      createTogetherRoomService({ displayName: 'Maria' })
    ).rejects.toThrow()

    expect(await selectTogetherRoomByCode('ATOM02')).toBeNull()
  })

  it('should retry room creation when a generated code already exists', async () => {
    vi.spyOn(togetherToken, 'generateRoomCode')
      .mockReturnValueOnce('RETRY1')
      .mockReturnValueOnce('RETRY1')
      .mockReturnValueOnce('RETRY2')

    const first = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in first)) throw new Error('expected room')

    const second = await createTogetherRoomService({ displayName: 'Maria' })
    if (!('room' in second)) throw new Error('expected room')

    expect(second.room.code).toBe('RETRY2')
    expect(second.participantToken).toHaveLength(64)
    expect(second.participantToken).not.toBe(first.participantToken)
  })
})
