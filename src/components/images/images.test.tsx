import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Images, ImagesProps } from '.'

const PROPS: ImagesProps = {
  tmdbId: 767,
  variant: 'movie',
}

describe('Images', () => {
  afterEach(() => cleanup())

  it('should be able to render Images server component', async () => {
    render(await Images(PROPS))

    const element = screen.getByTestId('images-masonry')
    expect(element).toBeTruthy()
  })
})
