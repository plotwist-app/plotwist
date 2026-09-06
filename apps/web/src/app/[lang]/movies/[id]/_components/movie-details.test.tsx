import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MovieDetails as MovieDetailsData } from '@/services/tmdb'
import { MovieDetails } from './movie-details'

const mocks = vi.hoisted(() => ({
  breadcrumbJsonLd: vi.fn(() => null),
  cookieGet: vi.fn(),
  details: vi.fn(),
  movieJsonLd: vi.fn(() => null),
}))

vi.mock('@/services/tmdb', () => ({
  tmdb: {
    movies: {
      details: mocks.details,
    },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: mocks.cookieGet,
  })),
}))

vi.mock('next/font/google', () => ({
  Instrument_Sans: () => ({
    className: 'instrument-sans',
  }),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/components/structured-data', () => ({
  BreadcrumbJsonLd: mocks.breadcrumbJsonLd,
  MovieJsonLd: mocks.movieJsonLd,
}))

vi.mock('./movie-actions', () => ({
  MovieActions: () => <div data-testid="movie-actions" />,
}))

vi.mock('./movie-collection', () => ({
  MovieCollection: () => <div data-testid="movie-collection" />,
}))

vi.mock('./movie-genres', () => ({
  MovieGenres: () => <div data-testid="movie-genres" />,
}))

vi.mock('./movie-rating', () => ({
  MovieRating: () => <div data-testid="movie-rating" />,
}))

vi.mock('./movie-tabs', () => ({
  MovieTabs: () => <div data-testid="movie-tabs" />,
}))

const movie = {
  backdrop_path: '/backdrop.jpg',
  belongs_to_collection: { id: 7 },
  genres: [{ id: 18, name: 'Drama' }],
  id: 42,
  overview: 'A story with an unexpected turn.',
  poster_path: '/poster.jpg',
  release_date: '2026-09-06',
  title: 'The Plot Twist',
  vote_average: 8.4,
  vote_count: 1200,
} as MovieDetailsData

describe('MovieDetails renderer selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.details.mockResolvedValue(movie)
  })

  afterEach(() => cleanup())

  it('renders the classic details by default with one details fetch', async () => {
    mocks.cookieGet.mockReturnValue(undefined)

    render(await MovieDetails({ id: movie.id, language: 'en-US' }))

    expect(mocks.details).toHaveBeenCalledTimes(1)
    expect(mocks.details).toHaveBeenCalledWith(movie.id, 'en-US')
    expect(screen.getByTestId('classic-movie-details')).toBeTruthy()
    expect(screen.queryByTestId('cinematic-movie-details')).toBeNull()
    expect(mocks.breadcrumbJsonLd).toHaveBeenCalledTimes(1)
    expect(mocks.movieJsonLd).toHaveBeenCalledTimes(1)
  })

  it('renders cinematic details from the UI cookie with one details fetch', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'cinematic' })

    render(await MovieDetails({ id: movie.id, language: 'en-US' }))

    expect(screen.getByTestId('cinematic-movie-details')).toBeTruthy()
    expect(screen.queryByTestId('classic-movie-details')).toBeNull()
    expect(mocks.details).toHaveBeenCalledTimes(1)
    expect(mocks.details).toHaveBeenCalledWith(movie.id, 'en-US')
    expect(mocks.breadcrumbJsonLd).toHaveBeenCalledTimes(1)
    expect(mocks.movieJsonLd).toHaveBeenCalledTimes(1)
  })
})
