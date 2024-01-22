import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { TEST_ID, TvShowCard, TvShowCardSkeleton } from '.'
import { mockTvShow } from '@/mocks/tmdb/tv-show/tv-show'
import { languages } from '../../../languages'

describe('tv-show-card', () => {
  afterEach(() => cleanup())

  it('should be able renders component correctly', () => {
    render(<TvShowCard tvShow={mockTvShow} />)

    const element = screen.getByTestId(TEST_ID)

    expect(element).toBeTruthy()
    expect(screen.getByText(mockTvShow.name)).toBeTruthy()
    expect(screen.getByText(mockTvShow.overview)).toBeTruthy()
    expect(screen.getByAltText(mockTvShow.name)).toBeTruthy()
  })

  it('should not be able to render the component when the backdrop is undefined', () => {
    const tvShowWithoutBackdrop = {
      ...mockTvShow,
      backdrop_path: undefined,
    }

    render(<TvShowCard tvShow={tvShowWithoutBackdrop} />)

    expect(screen.queryByTestId(TEST_ID)).not.toBeTruthy()
  })

  it('should use en-US as default language if none is provided', () => {
    render(<TvShowCard tvShow={mockTvShow} />)

    const element = screen.getByTestId(TEST_ID)
    expect(element.getAttribute('href')).includes('en-US')
  })

  it('should correctly handle all provided languages', () => {
    languages.forEach((language) => {
      render(<TvShowCard tvShow={mockTvShow} language={language} />)

      const element = screen.getByTestId(TEST_ID)
      expect(element.getAttribute('href')).includes(language)

      cleanup()
    })
  })

  it('should be able to render skeleton', () => {
    render(<TvShowCardSkeleton />)
  })
})
