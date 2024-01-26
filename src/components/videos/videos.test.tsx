import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Videos, VideosProps } from '.'

const PROPS: VideosProps = {
  tmdbId: 767,
  variant: 'movie',
}

describe('Videos', () => {
  afterEach(() => cleanup())

  it('should be able to render Videos server component', async () => {
    render(await Videos(PROPS))

    const element = screen.getByTestId('videos')
    expect(element).toBeTruthy()
  })
})
