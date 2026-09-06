import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import DesignPreviewPage from './page'

describe('Together design preview', () => {
  afterEach(() => cleanup())

  it('shows the three visual directions and recommendation', () => {
    render(<DesignPreviewPage />)

    expect(screen.getByText('Cópia literal')).toBeTruthy()
    expect(screen.getByText('Sistema cinematográfico')).toBeTruthy()
    expect(screen.getByText('Adaptação leve')).toBeTruthy()
    expect(screen.getByText('Recomendado')).toBeTruthy()
  })
})
