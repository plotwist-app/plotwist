import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TogetherMatch } from '@/services/together'
import { acknowledgeTogetherMatch } from './together-match-notifications'
import { TogetherVote } from './together-vote'

const mocks = vi.hoisted(() => ({
  createSwipe: vi.fn(),
  discover: vi.fn(),
  getMatches: vi.fn(),
  getRoom: vi.fn(),
  movieDetails: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
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
        choosing_with: 'Choosing with {count} people',
        see_matches: 'The match',
        empty_deck: 'That is all.',
        vote_nope: 'No',
        vote_maybe: 'Maybe',
        vote_yes: 'Yes',
        swipe_error: 'Could not save.',
        match_heading: 'It’s a match',
        match_interest_summary:
          '{count} people are interested · {percent}% match',
        continue_discovering: 'Continue discovering',
        view_matches: 'View matches',
        match_close: 'Close match',
      },
    },
  }),
}))

vi.mock('@/services/tmdb', () => ({
  tmdb: {
    movies: {
      discover: mocks.discover,
      details: mocks.movieDetails,
    },
  },
}))

vi.mock('@/services/together', () => ({
  clearTogetherToken: vi.fn(),
  createTogetherSwipe: mocks.createSwipe,
  getTogetherMatches: mocks.getMatches,
  getTogetherRoom: mocks.getRoom,
  getTogetherToken: () => 'participant-token',
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function wrapper(queryClient = createQueryClient()) {
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

const nextMatch = {
  ...match,
  tmdbId: 604,
  title: 'The Matrix Reloaded',
}

const movie = {
  id: 603,
  title: 'The Matrix',
  poster_path: '/matrix.jpg',
  release_date: '1999-03-30',
  overview: 'A hacker discovers the truth.',
  vote_average: 8.2,
}

const nextMovie = {
  ...movie,
  id: 604,
  title: 'The Matrix Reloaded',
  release_date: '2003-05-15',
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('TogetherVote provider deck filters', () => {
  beforeEach(() => {
    mocks.discover.mockResolvedValue({
      results: [],
      page: 1,
      total_pages: 1,
    })
    mocks.getMatches.mockResolvedValue({ matches: [] })
    mocks.movieDetails.mockResolvedValue(movie)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
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

  it('describes the full group by participant count while voting', async () => {
    mocks.getRoom.mockResolvedValue({
      ...room([], 'BR'),
      participants: [
        { id: 'host', displayName: 'Ana' },
        { id: 'second', displayName: 'Ben' },
        { id: 'third', displayName: 'Cleo' },
      ],
    })

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    expect(await screen.findByText('Choosing with 3 people')).toBeTruthy()
    expect(screen.queryByText('with Ben')).toBeNull()
  })
})

describe('TogetherVote match notifications', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mocks.getRoom.mockResolvedValue(room([], 'BR'))
    mocks.discover.mockResolvedValue({
      results: [movie],
      page: 1,
      total_pages: 1,
    })
    mocks.movieDetails.mockResolvedValue(movie)
    mocks.getMatches.mockResolvedValue({ matches: [] })
    mocks.createSwipe.mockResolvedValue({ swipe: {}, match: null })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('opens the celebration from the match returned by a swipe', async () => {
    mocks.createSwipe.mockResolvedValue({
      swipe: { id: 'swipe-id', tmdbId: 603, decision: 'LIKE' },
      match,
    })

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    fireEvent.click(await screen.findByRole('button', { name: 'Yes' }))

    expect(
      await screen.findByRole('heading', { name: 'It’s a match' })
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue discovering' })
    )
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('cancels a stale poll and replaces the matching cache entry from the swipe', async () => {
    const queryClient = createQueryClient()
    const queryKey = [
      'together-matches',
      'ABC123',
      'participant-token',
    ] as const
    const staleMatch = { ...match, likeCount: 1, matchPercent: 50 }
    const directMatch = { ...match, likeCount: 3, matchPercent: 75 }
    const stalePoll = deferred<{ matches: TogetherMatch[] }>()

    acknowledgeTogetherMatch('ABC123', staleMatch)
    acknowledgeTogetherMatch('ABC123', nextMatch)
    queryClient.setQueryData(queryKey, {
      matches: [staleMatch, nextMatch],
    })
    mocks.getMatches.mockReturnValueOnce(stalePoll.promise)
    mocks.createSwipe.mockResolvedValue({
      swipe: { id: 'swipe-id', tmdbId: 603, decision: 'LIKE' },
      match: directMatch,
    })

    render(<TogetherVote code="abc123" />, {
      wrapper: wrapper(queryClient),
    })

    await waitFor(() => expect(mocks.getMatches).toHaveBeenCalledOnce())
    fireEvent.click(await screen.findByRole('button', { name: 'Yes' }))

    await waitFor(() =>
      expect(queryClient.getQueryData(queryKey)).toEqual({
        matches: [directMatch, nextMatch],
      })
    )

    await act(async () => {
      stalePoll.resolve({ matches: [staleMatch] })
      await stalePoll.promise
    })

    expect(queryClient.getQueryData(queryKey)).toEqual({
      matches: [directMatch, nextMatch],
    })
  })

  it('keeps the next card and route unchanged when continuing', async () => {
    mocks.discover.mockResolvedValue({
      results: [movie, nextMovie],
      page: 1,
      total_pages: 1,
    })
    mocks.movieDetails.mockImplementation((id: number) =>
      Promise.resolve(id === nextMovie.id ? nextMovie : movie)
    )
    mocks.createSwipe.mockResolvedValue({
      swipe: { id: 'swipe-id', tmdbId: 603, decision: 'LIKE' },
      match,
    })

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    fireEvent.click(await screen.findByRole('button', { name: 'Yes' }))
    await screen.findByRole('heading', { name: 'It’s a match' })
    await waitFor(() => expect(screen.getByText(nextMovie.title)).toBeTruthy())

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue discovering' })
    )

    expect(screen.getByRole('heading', { name: nextMovie.title })).toBeTruthy()
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('navigates to the room matches from the celebration', async () => {
    mocks.createSwipe.mockResolvedValue({
      swipe: { id: 'swipe-id', tmdbId: 603, decision: 'LIKE' },
      match,
    })

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    fireEvent.click(await screen.findByRole('button', { name: 'Yes' }))
    fireEvent.click(await screen.findByRole('button', { name: 'View matches' }))

    expect(mocks.push).toHaveBeenCalledWith('/pt-BR/together/ABC123/matches')
  })

  it('opens the same celebration for a match returned by polling', async () => {
    vi.useFakeTimers()
    mocks.getMatches
      .mockResolvedValueOnce({ matches: [] })
      .mockResolvedValue({ matches: [match] })

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    await vi.waitFor(() => expect(mocks.getMatches).toHaveBeenCalledOnce())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    await vi.waitFor(() =>
      expect(screen.getByRole('heading', { name: 'It’s a match' })).toBeTruthy()
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue discovering' })
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(screen.queryByRole('heading', { name: 'It’s a match' })).toBeNull()
  })

  it('recovers polling after an error while voting remains usable', async () => {
    vi.useFakeTimers()
    mocks.getMatches
      .mockRejectedValueOnce(new Error('temporary polling failure'))
      .mockResolvedValue({ matches: [] })

    render(<TogetherVote code="abc123" />, { wrapper: wrapper() })

    await vi.waitFor(() => expect(mocks.getMatches).toHaveBeenCalledOnce())
    const maybeButton = await vi.waitFor(() =>
      screen.getByRole('button', { name: 'Maybe' })
    )
    fireEvent.click(maybeButton)
    await vi.waitFor(() => expect(mocks.createSwipe).toHaveBeenCalledOnce())

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(mocks.getMatches).toHaveBeenCalledTimes(2)
    expect(mocks.createSwipe).toHaveBeenCalledWith(
      'ABC123',
      'participant-token',
      expect.objectContaining({ decision: 'MAYBE', tmdbId: movie.id })
    )
  })
})
