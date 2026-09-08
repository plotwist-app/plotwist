import { beforeEach, describe, expect, it } from 'vitest'
import type { TogetherMatch } from '@/services/together'
import {
  acknowledgeTogetherMatch,
  firstUnacknowledgedTogetherMatch,
  getAcknowledgedTogetherMatchKeys,
  togetherMatchKey,
} from './together-match-notifications'

const match: TogetherMatch = {
  tmdbId: 603,
  mediaType: 'MOVIE',
  title: 'The Matrix',
  posterPath: '/matrix.jpg',
  voteAverage: 8.2,
  releaseDate: '1999-03-30',
  likeCount: 2,
  matchPercent: 100,
}

describe('Together match notifications', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('builds a stable key from the media identity', () => {
    expect(togetherMatchKey(match)).toBe('MOVIE:603')
    expect(
      togetherMatchKey({
        ...match,
        title: 'Matrix',
        likeCount: 4,
        matchPercent: 50,
      })
    ).toBe('MOVIE:603')
  })

  it('scopes acknowledged match keys to each room', () => {
    acknowledgeTogetherMatch('abc123', match)

    expect(getAcknowledgedTogetherMatchKeys('ABC123')).toEqual(
      new Set(['MOVIE:603'])
    )
    expect(getAcknowledgedTogetherMatchKeys('another-room')).toEqual(new Set())
  })

  it('does not add an acknowledged match more than once', () => {
    acknowledgeTogetherMatch('abc123', match)
    acknowledgeTogetherMatch('ABC123', match)

    expect([...getAcknowledgedTogetherMatchKeys('abc123')]).toEqual([
      'MOVIE:603',
    ])
  })

  it('does not return an acknowledged match again', () => {
    const nextMatch = { ...match, tmdbId: 604, title: 'The Matrix Reloaded' }
    acknowledgeTogetherMatch('abc123', match)

    expect(
      firstUnacknowledgedTogetherMatch('ABC123', [match, nextMatch])
    ).toEqual(nextMatch)

    acknowledgeTogetherMatch('abc123', nextMatch)
    expect(
      firstUnacknowledgedTogetherMatch('ABC123', [match, nextMatch])
    ).toBeNull()
  })
})
