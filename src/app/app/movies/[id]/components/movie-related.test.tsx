import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MovieRelatedContent } from './movie-related'

import { similar } from '@/mocks/tmdb/movie/similar'

describe('movie-related', () => {
  it('should be able render all related movies', () => {
    render(<MovieRelatedContent results={similar} />)

    const renderedItems = screen.getAllByTestId('movie-card')
    expect(renderedItems.length).toBe(similar.length)
  })
})
