import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Videos, type VideosProps } from '.'

const PROPS: VideosProps = {
  tmdbId: 673, // // Harry Potter and the Prisoner of Azkaban
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
