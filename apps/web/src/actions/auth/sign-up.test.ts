import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signUp } from './sign-up'

const mocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  createSession: vi.fn(),
  getMe: vi.fn(),
  postLogin: vi.fn(),
  postUsersCreate: vi.fn(),
  redirect: vi.fn(),
  setAuthToken: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

vi.mock('@/api/auth', () => ({
  postLogin: mocks.postLogin,
}))

vi.mock('@/api/users', () => ({
  getMe: mocks.getMe,
  postUsersCreate: mocks.postUsersCreate,
}))

vi.mock('@/app/lib/session', () => ({
  createSession: mocks.createSession,
}))

vi.mock('@/services/api-client', () => ({
  setAuthToken: mocks.setAuthToken,
}))

vi.mock('@/services/api', () => ({
  api: { post: mocks.apiPost },
}))

const input = {
  email: 'ana@example.com',
  password: 'password123',
  username: 'ana',
  language: 'pt-BR' as const,
}

describe('signUp post-auth navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.postUsersCreate.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      status: 201,
    })
    mocks.postLogin.mockResolvedValue({
      data: { token: 'auth-token' },
      status: 200,
    })
    mocks.getMe.mockResolvedValue({
      data: { user: { displayName: null } },
    })
    mocks.apiPost.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/session' },
    })
    mocks.redirect.mockImplementation((target: string) => {
      throw new Error(`NEXT_REDIRECT:${target}`)
    })
  })

  it('continues to checkout when a new user still needs onboarding', async () => {
    await expect(
      signUp({ ...input, redirectToCheckout: true })
    ).rejects.toThrow('NEXT_REDIRECT:https://checkout.stripe.com/session')

    expect(mocks.apiPost).toHaveBeenCalledOnce()
    expect(mocks.redirect).not.toHaveBeenCalledWith('/pt-BR/onboarding')
  })

  it('keeps normal non-checkout sign-up on onboarding for a new user', async () => {
    await expect(signUp(input)).rejects.toThrow(
      'NEXT_REDIRECT:/pt-BR/onboarding'
    )

    expect(mocks.apiPost).not.toHaveBeenCalled()
  })
})
