import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const { signIn } = await import('./sign-in')

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
      redirectTo: '/pt-BR/together',
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
      redirectTo,
    })

    expect(mocks.redirect).toHaveBeenCalledWith('/pt-BR/home')
  })
})
