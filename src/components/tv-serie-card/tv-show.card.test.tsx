import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { TEST_ID, TvSerieCard, TvSerieCardSkeleton } from '.'
import { mockTvSerie } from '@/mocks/tmdb/tv-show/tv-show'
import { languages } from '../../../languages'

describe('tv-show-card', () => {
  afterEach(() => cleanup())

  it('should be able renders component correctly', () => {
    render(<TvSerieCard tvSerie={mockTvSerie} />)

    const element = screen.getByTestId(TEST_ID)

    expect(element).toBeTruthy()
    expect(screen.getByText(mockTvSerie.name)).toBeTruthy()
    expect(screen.getByText(mockTvSerie.overview)).toBeTruthy()
    expect(screen.getByAltText(mockTvSerie.name)).toBeTruthy()
  })

  it('should not be able to render the component when the backdrop is undefined', () => {
    const tvSerieWithoutBackdrop = {
      ...mockTvSerie,
      backdrop_path: undefined,
    }

    render(<TvSerieCard tvSerie={tvSerieWithoutBackdrop} />)

    expect(screen.queryByTestId(TEST_ID)).not.toBeTruthy()
  })

  it('should use en-US as default language if none is provided', () => {
    render(<TvSerieCard tvSerie={mockTvSerie} />)

    const element = screen.getByTestId(TEST_ID)
    expect(element.getAttribute('href')).includes('en-US')
  })

  it('should correctly handle all provided languages', () => {
    languages.forEach((language) => {
      render(<TvSerieCard tvSerie={mockTvSerie} language={language} />)

      const element = screen.getByTestId(TEST_ID)
      expect(element.getAttribute('href')).includes(language)

      cleanup()
    })
  })

  it('should be able to render skeleton', () => {
    render(<TvSerieCardSkeleton />)
  })
})
