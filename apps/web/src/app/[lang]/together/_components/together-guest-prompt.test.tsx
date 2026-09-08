import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WelcomeScreen } from './welcome-screen'

const mocks = vi.hoisted(() => ({
  user: undefined as { id: string } | undefined,
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'pt-BR',
    dictionary: {
      together: {
        night_for_two: 'A night together',
        title: 'Tonight’s movie',
        subtitle: 'Choose together.',
        have_invite: 'I have an invite',
        back: 'Back',
        guest_prompt_title: 'Make every pick more personal',
        guest_prompt_body:
          'Sign in to use your saved services and preferences for better recommendations.',
        guest_prompt_sign_in: 'Sign in',
        continue_as_guest: 'Continue as guest',
      },
    },
  }),
}))

vi.mock('@/context/session', () => ({
  useSession: () => ({ user: mocks.user }),
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

describe('Together guest prompt', () => {
  afterEach(() => {
    cleanup()
    mocks.user = undefined
  })

  it('recommends signing in without blocking provider setup', () => {
    render(<WelcomeScreen />)

    expect(
      screen.getByText(
        'Sign in to use your saved services and preferences for better recommendations.'
      )
    ).toBeTruthy()
    expect(screen.getByText('Provider setup')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')
    ).toBe('/pt-BR/sign-in?redirect=%2Fpt-BR%2Ftogether')
  })

  it('lets the host dismiss the prompt and continue as a guest', () => {
    render(<WelcomeScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue as guest' }))

    expect(screen.queryByText('Make every pick more personal')).toBeNull()
    expect(screen.getByText('Provider setup')).toBeTruthy()
  })

  it('does not show the prompt to an authenticated host', () => {
    mocks.user = { id: 'user-1' }

    render(<WelcomeScreen />)

    expect(screen.queryByText('Make every pick more personal')).toBeNull()
    expect(screen.getByText('Provider setup')).toBeTruthy()
  })
})
