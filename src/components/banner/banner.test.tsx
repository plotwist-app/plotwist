import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Banner } from '.'

const url = 'https://example.com/banner-image.jpg'

describe('Banner', () => {
  it('should render with correct image and brightness', () => {
    render(<Banner url={url} />)

    const element = screen.getByTestId('banner')
    const expectedBrightness = 'brightness-50'

    expect(element.classList).toContain(expectedBrightness)
    expect(element.style.backgroundImage).toBe(`url(${url})`)
  })
})
