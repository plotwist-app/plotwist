import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signIn } from './sign-in'

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  createSession: vi.fn(),
  getMe: vi.fn(),
  postLogin: vi.fn(),
  redirect: vi.fn(),
  setAuthToken: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/api/auth', () => ({
  postLogin: mocks.postLogin,
}))

vi.mock('@/api/users', () => ({
  getMe: mocks.getMe,
}))

vi.mock('@/app/lib/session', () => ({
  createSession: mocks.createSession,
}))

vi.mock('@/services/api-client', () => ({
  setAuthToken: mocks.setAuthToken,
}))

describe('signIn redirect enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.postLogin.mockResolvedValue({
      data: { token: 'auth-token' },
      status: 200,
    })
    mocks.getMe.mockResolvedValue({
      data: { user: { displayName: 'Ana' } },
    })
  })

  it('preserves a validated target in the current locale', async () => {
    await signIn({
      login: 'ana@example.com',
      password: 'password123',
      language: 'pt-BR',
      navigation: { mode: 'redirect', target: '/pt-BR/together' },
    })

    expect(mocks.redirect).toHaveBeenCalledWith('/pt-BR/together')
  })

  it.each([
    'https://evil.example/pt-BR/together',
    '//evil.example/pt-BR/together',
    '/en-US/together',
  ])('falls back to localized home for unsafe target %s', async redirectTo => {
    await signIn({
      login: 'ana@example.com',
      password: 'password123',
      language: 'pt-BR',
      navigation: { mode: 'redirect', target: redirectTo },
    })

    expect(mocks.redirect).toHaveBeenCalledWith('/pt-BR/home')
  })

  it('preserves explicit no-navigation mode through onboarding checks', async () => {
    mocks.getMe.mockResolvedValue({
      data: { user: { displayName: null } },
    })

    await signIn({
      login: 'ana@example.com',
      password: 'password123',
      language: 'pt-BR',
      navigation: { mode: 'none' },
    })

    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it('keeps normal interactive sign-in onboarding behavior', async () => {
    mocks.getMe.mockResolvedValue({
      data: { user: { displayName: null } },
    })

    await signIn({
      login: 'ana@example.com',
      password: 'password123',
      language: 'pt-BR',
      navigation: { mode: 'redirect', target: '/pt-BR/together' },
    })

    expect(mocks.redirect).toHaveBeenCalledWith('/pt-BR/onboarding')
  })
})
