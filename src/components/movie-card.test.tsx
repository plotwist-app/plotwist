import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MovieCard } from './movie-card'

import { movie } from '@/mocks/tmdb/movie/movie'

describe('movie-card', () => {
  afterEach(() => cleanup())

  it('should be able renders component correctly', () => {
    render(<MovieCard movie={movie} />)

    const movieCardElement = screen.getByTestId('movie-card')
    expect(movieCardElement).toBeTruthy()

    const titleElement = screen.getByText(movie.title)
    expect(titleElement).toBeTruthy()

    const overviewElement = screen.getByText(movie.overview)
    expect(overviewElement).toBeTruthy()

    const backdropImage = screen.getByAltText(movie.title)
    expect(backdropImage).toBeTruthy()
  })

  it('should not be able to render the component when the backdrop is undefined', () => {
    const movieWithoutBackdrop = {
      ...movie,
      backdrop_path: undefined,
    }

    render(<MovieCard movie={movieWithoutBackdrop} />)

    const movieCardElement = screen.queryByTestId('movie-card')
    expect(movieCardElement).not.toBeTruthy()
  })
})
