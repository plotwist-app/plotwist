import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MovieImagesContent } from './movie-images'

import { images } from '@/mocks/tmdb/movie/images'

describe('movie-images', () => {
  it('should be able render all movie images', () => {
    render(<MovieImagesContent backdrops={images.backdrops} />)

    const renderedItems = screen.getAllByTestId('movie-image')
    expect(renderedItems.length).toBe(images.backdrops.length)
  })
})
