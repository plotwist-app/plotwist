import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TogetherVote } from './together-vote'

const mocks = vi.hoisted(() => ({
  discover: vi.fn(),
  getRoom: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mocks.replace,
  }),
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'pt-BR',
    dictionary: {
      together: {
        loading: 'Loading...',
        tonight_with: 'with {name}',
        see_matches: 'The match',
        empty_deck: 'That is all.',
        vote_nope: 'No',
        vote_maybe: 'Maybe',
        vote_yes: 'Yes',
        swipe_error: 'Could not save.',
      },
    },
  }),
}))

vi.mock('@/services/tmdb', () => ({
  tmdb: {
    movies: {
      discover: mocks.discover,
      details: vi.fn(),
    },
  },
}))

vi.mock('@/services/together', () => ({
  clearTogetherToken: vi.fn(),
  createTogetherSwipe: vi.fn(),
  getTogetherRoom: mocks.getRoom,
  getTogetherToken: () => 'participant-token',
}))

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function room(watchProviderIds: number[] | null, watchRegion = 'BR') {
  return {
    room: {
      id: 'room-id',
      code: 'ABC123',
      watchProviderIds,
      watchRegion,
      maxRuntime: null,
      mood: 'ANY',
      maxParticipants: 4,
      createdAt: '2026-09-08T00:00:00.000Z',
    },
    participants: [{ id: 'host', displayName: 'Ana' }],
    me: { id: 'host', displayName: 'Ana' },
    swipedIds: [],
  }
}

describe('TogetherVote provider deck filters', () => {
  beforeEach(() => {
    mocks.discover.mockResolvedValue({
      results: [],
      page: 1,
      total_pages: 1,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('discovers movies from the room providers and region', async () => {
    mocks.getRoom.mockResolvedValue(room([8, 337], 'BR'))

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    await waitFor(() =>
      expect(mocks.discover).toHaveBeenCalledWith({
        language: 'pt-BR',
        page: 1,
        filters: expect.objectContaining({
          with_watch_providers: '8|337',
          watch_region: 'BR',
        }),
      })
    )
  })

  it.each([
    [],
    null,
  ])('omits availability filters when room providers are %s', async watchProviderIds => {
    mocks.getRoom.mockResolvedValue(room(watchProviderIds))

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    await waitFor(() => expect(mocks.discover).toHaveBeenCalledOnce())
    const filters = mocks.discover.mock.calls[0]?.[0].filters
    expect(filters).not.toHaveProperty('with_watch_providers')
    expect(filters).not.toHaveProperty('watch_region')
  })
})
