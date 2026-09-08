import { describe, expect, it } from 'vitest'
import { createTogetherRoomService } from './create-room'
import { createTogetherSwipeService } from './create-swipe'
import { getTogetherMatchesService } from './get-matches'
import { joinTogetherRoomService } from './join-room'

const dune = {
  tmdbId: 438631,
  mediaType: 'MOVIE' as const,
  title: 'Dune',
  posterPath: '/dune.jpg',
  voteAverage: 8,
}

describe('together matching', () => {
  it('should not match when only one person likes a title', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    const swipe = await createTogetherSwipeService({
      code: host.room.code,
      participantToken: host.participantToken,
      decision: 'LIKE',
      ...dune,
    })

    expect(swipe).toEqual(
      expect.objectContaining({
        match: null,
        swipe: expect.objectContaining({ title: 'Dune', decision: 'LIKE' }),
      })
    )

    const matches = await getTogetherMatchesService({
      code: host.room.code,
      participantToken: host.participantToken,
    })
    expect(matches).toEqual({ matches: [] })
  })

  it('should match when a second person likes the same title', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    await createTogetherSwipeService({
      code: host.room.code,
      participantToken: host.participantToken,
      decision: 'LIKE',
      ...dune,
    })

    const guest = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Maria',
    })
    if (!('participantToken' in guest)) throw new Error('expected join')

    const swipe = await createTogetherSwipeService({
      code: host.room.code,
      participantToken: guest.participantToken,
      decision: 'LIKE',
      ...dune,
    })

    expect(swipe).toEqual(
      expect.objectContaining({
        match: expect.objectContaining({
          tmdbId: 438631,
          title: 'Dune',
          likeCount: 2,
          matchPercent: 100,
        }),
      })
    )

    const matches = await getTogetherMatchesService({
      code: host.room.code,
      participantToken: guest.participantToken,
    })

    expect(matches).toEqual({
      matches: [
        expect.objectContaining({
          tmdbId: 438631,
          likeCount: 2,
          matchPercent: 100,
          highlighted: true,
        }),
      ],
    })
  })

  it('should not match on a pass', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    await createTogetherSwipeService({
      code: host.room.code,
      participantToken: host.participantToken,
      decision: 'LIKE',
      ...dune,
    })

    const guest = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Maria',
    })
    if (!('participantToken' in guest)) throw new Error('expected join')

    const swipe = await createTogetherSwipeService({
      code: host.room.code,
      participantToken: guest.participantToken,
      decision: 'PASS',
      ...dune,
    })

    expect(swipe).toEqual(expect.objectContaining({ match: null }))
  })

  it('should match when one person says yes and the other says maybe', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    await createTogetherSwipeService({
      code: host.room.code,
      participantToken: host.participantToken,
      decision: 'LIKE',
      ...dune,
    })

    const guest = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Maria',
    })
    if (!('participantToken' in guest)) throw new Error('expected join')

    const swipe = await createTogetherSwipeService({
      code: host.room.code,
      participantToken: guest.participantToken,
      decision: 'MAYBE',
      ...dune,
    })

    expect(swipe).toEqual(
      expect.objectContaining({
        match: expect.objectContaining({
          tmdbId: 438631,
          likeCount: 2,
        }),
      })
    )
  })

  it('should report a 50 percent match when two of four participants are interested', async () => {
    const host = await createTogetherRoomService({ displayName: 'Henrique' })
    if (!('room' in host)) throw new Error('expected room')

    const second = await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Maria',
    })
    if (!('participantToken' in second)) throw new Error('expected join')

    await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'João',
    })
    await joinTogetherRoomService({
      code: host.room.code,
      displayName: 'Ana',
    })

    await createTogetherSwipeService({
      code: host.room.code,
      participantToken: host.participantToken,
      decision: 'LIKE',
      ...dune,
    })
    const result = await createTogetherSwipeService({
      code: host.room.code,
      participantToken: second.participantToken,
      decision: 'LIKE',
      ...dune,
    })

    expect(result.match).toEqual(
      expect.objectContaining({ likeCount: 2, matchPercent: 50 })
    )
  })
})
