import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MovieDetails } from '@/services/tmdb'
import { MovieActions } from './movie-actions'
import { MovieRating } from './movie-rating'

vi.mock('@/components/lists', () => ({
  ListsDropdown: ({ item }: { item: MovieDetails }) => (
    <div data-testid="lists-dropdown" data-movie-id={item.id} />
  ),
}))

vi.mock('@/components/item-review', () => ({
  ItemReview: () => <div data-testid="item-review" />,
}))

vi.mock('@/components/item-status', () => ({
  ItemStatus: ({
    mediaType,
    tmdbId,
  }: {
    mediaType: string
    tmdbId: number
  }) => (
    <div
      data-testid="item-status"
      data-media-type={mediaType}
      data-movie-id={tmdbId}
    />
  ),
}))

vi.mock('@/components/share-page-button', () => ({
  SharePageButton: ({ language, path }: { language: string; path: string }) => (
    <div
      data-testid="share-page-button"
      data-language={language}
      data-path={path}
    />
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

const movie = {
  id: 42,
  vote_average: 7.26,
  vote_count: 321,
} as MovieDetails

describe('shared movie presentation primitives', () => {
  afterEach(() => cleanup())

  it('passes the movie and localized media props to every action', () => {
    render(<MovieActions movie={movie} language="pt-BR" />)

    expect(screen.getByTestId('lists-dropdown').dataset.movieId).toBe('42')
    expect(screen.getByTestId('item-review')).toBeTruthy()
    expect(screen.getByTestId('item-status').dataset.mediaType).toBe('MOVIE')
    expect(screen.getByTestId('item-status').dataset.movieId).toBe('42')
    expect(screen.getByTestId('share-page-button').dataset.language).toBe(
      'pt-BR'
    )
    expect(screen.getByTestId('share-page-button').dataset.path).toBe(
      'movies/42'
    )
  })

  it('renders the TMDB score rounded to one decimal place', () => {
    render(<MovieRating movie={movie} />)

    expect(screen.getByText('7.3')).toBeTruthy()
    expect(screen.queryByText('7.26')).toBeNull()
  })

  it('exposes the TMDB score and vote count through a focusable trigger', () => {
    render(<MovieRating movie={movie} />)

    const trigger = screen.getByRole('button', {
      name: 'TMDB rating 7.3 out of 10, 321 votes',
    })

    expect(trigger.tabIndex).toBe(0)
  })
})
