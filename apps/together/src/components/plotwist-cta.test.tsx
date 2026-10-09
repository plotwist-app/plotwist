import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WelcomeScreen } from './welcome-screen'

const mocks = vi.hoisted(() => ({
  track: vi.fn(),
}))

vi.mock('@/lib/analytics', () => ({
  track: mocks.track,
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'pt-BR',
    dictionary: {
      together: {
        group_kicker: 'A night together',
        title: 'Tonight’s movie',
        subtitle: 'Choose together.',
        have_invite: 'I have an invite',
        back: 'Back',
        plotwist_cta_title: 'Want recommendations that know your taste?',
        plotwist_cta_body:
          'Plotwist learns what you love and where you watch to recommend better every time.',
        plotwist_cta_button: 'Create a free Plotwist account',
        plotwist_cta_dismiss: 'Not now',
      },
    },
  }),
}))

vi.mock('./create-invite-form', () => ({
  CreateInviteForm: () => <div>Provider setup</div>,
}))

vi.mock('./join-invite-form', () => ({
  JoinInviteForm: () => <div>Join invite</div>,
}))

vi.mock('./together-mark', () => ({
  TogetherMark: () => <div>Together</div>,
}))

vi.mock('./together-shell', () => ({
  TogetherShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

describe('Plotwist conversion CTA', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('links to Plotwist sign-up with campaign tags without blocking setup', () => {
    const { container } = render(<WelcomeScreen />)

    expect(
      screen.getByText(
        'Plotwist learns what you love and where you watch to recommend better every time.'
      )
    ).toBeTruthy()
    expect(screen.getByText('Provider setup')).toBeTruthy()

    const link = screen.getByRole('link', {
      name: 'Create a free Plotwist account',
    })
    const href = new URL(link.getAttribute('href') ?? '')
    expect(`${href.origin}${href.pathname}`).toBe(
      'https://plotwist.app/pt-BR/sign-up'
    )
    expect(Object.fromEntries(href.searchParams)).toEqual({
      utm_source: 'together',
      utm_medium: 'referral',
      utm_campaign: 'together_mvp',
    })
    expect(
      Array.from(container.querySelectorAll('a[href], button')).slice(0, 2)
    ).toEqual([link, screen.getByRole('button', { name: 'Not now' })])
  })

  it('tracks the click before leaving for Plotwist', () => {
    render(<WelcomeScreen />)
    const link = screen.getByRole('link', {
      name: 'Create a free Plotwist account',
    })
    link.addEventListener('click', event => event.preventDefault())

    fireEvent.click(link)

    expect(mocks.track).toHaveBeenCalledWith('plotwist_cta_clicked')
  })

  it('can be dismissed to continue without an account', () => {
    render(<WelcomeScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }))

    expect(
      screen.queryByText('Want recommendations that know your taste?')
    ).toBeNull()
    expect(screen.getByText('Provider setup')).toBeTruthy()
    expect(mocks.track).not.toHaveBeenCalled()
  })
})
