import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UiVersionControl } from './ui-version-control'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

const labels = {
  label: 'New interface',
  experimentalLabel: 'Experimental',
  errorLabel: 'Could not update the interface preference.',
}

describe('UiVersionControl', () => {
  afterEach(() => {
    cleanup()
    refresh.mockClear()
    // biome-ignore lint/suspicious/noDocumentCookie: Reset the cookie changed by the control.
    document.cookie = 'plotwist-ui=; Path=/; Max-Age=0; SameSite=Lax'
  })

  it('persists the cinematic preference and refreshes the route', () => {
    const { rerender } = render(
      <UiVersionControl initialVersion="classic" {...labels} />
    )

    fireEvent.click(screen.getByRole('switch', { name: labels.label }))

    expect(document.cookie).toContain('plotwist-ui=cinematic')
    expect(refresh).toHaveBeenCalledOnce()

    rerender(<UiVersionControl initialVersion="cinematic" {...labels} />)

    expect(
      screen
        .getByRole('switch', { name: labels.label })
        .getAttribute('data-state')
    ).toBe('checked')
  })
})
