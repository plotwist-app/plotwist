import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SignInPage from './page'

vi.mock('@/actions/auth/sign-in', () => ({
  signIn: vi.fn(),
}))

vi.mock('@/utils/dictionaries', () => ({
  getDictionary: () =>
    Promise.resolve({
      access_plotwist: 'Access Plotwist',
      do_not_have_an_account: 'No account?',
      create_now: 'Create now',
    }),
}))

vi.mock('@/components/pattern', () => ({
  Pattern: () => null,
}))

vi.mock('next-view-transitions', () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('./_sign-in-form', () => ({
  SignInForm: ({ redirectTo }: { redirectTo: string }) => (
    <output aria-label="Sign-in redirect">{redirectTo}</output>
  ),
}))

describe('SignInPage redirect target', () => {
  afterEach(cleanup)

  it('passes a safe localized query target to the sign-in form', async () => {
    const page = await SignInPage({
      params: Promise.resolve({ lang: 'pt-BR' }),
      searchParams: Promise.resolve({ redirect: '/pt-BR/together' }),
    })

    render(page)

    expect(screen.getByLabelText('Sign-in redirect').textContent).toBe(
      '/pt-BR/together'
    )
  })

  it('falls back to localized home for an unsafe query target', async () => {
    const page = await SignInPage({
      params: Promise.resolve({ lang: 'pt-BR' }),
      searchParams: Promise.resolve({ redirect: '//evil.example' }),
    })

    render(page)

    expect(screen.getByLabelText('Sign-in redirect').textContent).toBe(
      '/pt-BR/home'
    )
  })
})
