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
  MovieActions: ({
    language,
    movie,
  }: {
    language: string
    movie: MovieDetailsData
  }) => (
    <div
      data-testid="movie-actions"
      data-language={language}
      data-movie-id={movie.id}
    />
  ),
}))

vi.mock('./movie-collection', () => ({
  MovieCollection: ({
    collectionId,
    language,
  }: {
    collectionId: number
    language: string
  }) => (
    <div
      data-testid="movie-collection"
      data-collection-id={collectionId}
      data-language={language}
    />
  ),
}))

vi.mock('./movie-genres', () => ({
  MovieGenres: ({
    className,
    genres,
  }: {
    className?: string
    genres: MovieDetailsData['genres']
  }) => (
    <div
      className={className}
      data-testid="movie-genres"
      data-genre-count={genres.length}
    />
  ),
}))

vi.mock('./movie-rating', () => ({
  MovieRating: ({ movie }: { movie: MovieDetailsData }) => (
    <div data-testid="movie-rating" data-vote-count={movie.vote_count} />
  ),
}))

vi.mock('./movie-tabs', () => ({
  MovieTabs: ({
    language,
    movie,
  }: {
    language: string
    movie: MovieDetailsData
  }) => (
    <div
      data-testid="movie-tabs"
      data-language={language}
      data-movie-id={movie.id}
    />
  ),
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

const parseHsl = (value: string) => {
  const match = value.match(
    /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/
  ) as RegExpMatchArray
  const hue = Number(match[1])
  const saturation = Number(match[2]) / 100
  const lightness = Number(match[3]) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const segment = hue / 60
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1))
  const [red, green, blue] =
    segment < 1
      ? [chroma, secondary, 0]
      : segment < 2
        ? [secondary, chroma, 0]
        : segment < 3
          ? [0, chroma, secondary]
          : segment < 4
            ? [0, secondary, chroma]
            : segment < 5
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary]
  const offset = lightness - chroma / 2

  return [red + offset, green + offset, blue + offset]
}

const relativeLuminance = (color: number[]) =>
  color
    .map(channel =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    )
    .reduce(
      (luminance, channel, index) =>
        luminance + channel * [0.2126, 0.7152, 0.0722][index],
      0
    )

const contrastRatio = (first: string, second: string) => {
  const firstLuminance = relativeLuminance(parseHsl(first))
  const secondLuminance = relativeLuminance(parseHsl(second))
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

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
    expect(screen.getByTestId('movie-actions').dataset).toMatchObject({
      language: 'en-US',
      movieId: '42',
    })
    expect(screen.getByTestId('movie-genres').dataset.genreCount).toBe('1')
    expect(screen.getByTestId('movie-rating').dataset.voteCount).toBe('1200')
    expect(screen.getByTestId('movie-collection').dataset).toMatchObject({
      collectionId: '7',
      language: 'en-US',
    })
    expect(screen.getByTestId('movie-tabs').dataset).toMatchObject({
      language: 'en-US',
      movieId: '42',
    })
    expect(screen.getByText(movie.overview)).toBeTruthy()
  })

  it('falls back to classic details for an invalid UI cookie', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'cinematic-preview' })

    render(await MovieDetails({ id: movie.id, language: 'en-US' }))

    expect(screen.getByTestId('classic-movie-details')).toBeTruthy()
    expect(screen.queryByTestId('cinematic-movie-details')).toBeNull()
  })

  it('keeps cinematic primary text at WCAG AA contrast', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'cinematic' })

    render(await MovieDetails({ id: movie.id, language: 'en-US' }))

    const root = screen.getByTestId('cinematic-movie-details')
    const primary = root.style.getPropertyValue('--primary')
    const primaryForeground = root.style.getPropertyValue(
      '--primary-foreground'
    )

    expect(contrastRatio(primary, primaryForeground)).toBeGreaterThanOrEqual(
      4.5
    )
  })

  it('stacks the cinematic hero and safely wraps its title below sm', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'cinematic' })

    render(await MovieDetails({ id: movie.id, language: 'en-US' }))

    const title = screen.getByRole('heading', { level: 1, name: movie.title })
    const heroGrid = title.closest('article')?.parentElement
    const contentRow = screen.getByText(movie.overview).parentElement

    expect(heroGrid?.className.split(' ')).toContain('grid-cols-1')
    expect(heroGrid?.className).toContain('sm:grid-cols-[180px_minmax(0,1fr)]')
    expect(contentRow?.className.split(' ')).toEqual(
      expect.arrayContaining([
        'col-span-1',
        'sm:col-span-2',
        'lg:col-start-2',
        'lg:col-end-3',
      ])
    )
    expect(title.className).toContain('[overflow-wrap:anywhere]')
    expect(screen.getByTestId('movie-genres').className).toContain(
      'whitespace-normal'
    )
  })

  it('renders existing banner and poster fallbacks when images are missing', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'cinematic' })
    mocks.details.mockResolvedValue({
      ...movie,
      backdrop_path: null,
      poster_path: null,
    })

    render(await MovieDetails({ id: movie.id, language: 'en-US' }))

    expect(screen.getAllByText(movie.title)).toHaveLength(3)
  })
})
