import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { movie } from '@/mocks/tmdb/movie/movie'
import { languages } from '../../../../languages'
import { MovieCard, MovieCardSkeleton } from '.'

describe('movie-card', () => {
  afterEach(() => cleanup())

  it('should be able renders component correctly', () => {
    render(<MovieCard movie={movie} />)

    expect(screen.getByTestId('movie-card')).toBeTruthy()
    expect(screen.getByText(movie.title)).toBeTruthy()
    expect(screen.getByText(movie.overview)).toBeTruthy()
    expect(screen.getByAltText(movie.title)).toBeTruthy()
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

  it('should use en-US as default language if none is provided', () => {
    render(<MovieCard movie={movie} />)

    const element = screen.getByTestId('movie-card')
    expect(element.getAttribute('href')).includes('en-US')
  })

  it('should correctly handle all provided languages', () => {
    languages.forEach((language) => {
      render(<MovieCard movie={movie} language={language} />)

      const element = screen.getByTestId('movie-card')
      expect(element.getAttribute('href')).includes(language)

      cleanup()
    })
  })

  it('should be able to render skeleton', () => {
    render(<MovieCardSkeleton />)
  })
})
