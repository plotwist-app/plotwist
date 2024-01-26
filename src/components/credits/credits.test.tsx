import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Credits, CreditsProps } from '.'

const PROPS: CreditsProps = {
  id: 767,
  language: 'en-US',
  variant: 'movie',
}

describe('Credits', () => {
  afterEach(() => cleanup())

  it('should be able to render credits server component', async () => {
    render(await Credits(PROPS))

    const element = screen.getByTestId('credits')
    expect(element).toBeTruthy()
  })

  it('should be able to render cast and crew sections', async () => {
    render(await Credits(PROPS))

    const [cast, crew] = screen.getAllByRole('heading')

    expect(cast.textContent).toBe('Cast')
    expect(crew.textContent).toBe('Crew')
  })

  it('should be able to render tv variant', async () => {
    render(await Credits({ language: 'en-US', variant: 'tv', id: 84958 }))

    const element = screen.getByTestId('credits')
    expect(element).toBeTruthy()
  })
})
