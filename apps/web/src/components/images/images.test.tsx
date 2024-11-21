import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Images, type ImagesProps } from '.'

const PROPS: ImagesProps = {
  tmdbId: 673, // Harry Potter and the Prisoner of Azkaban
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
