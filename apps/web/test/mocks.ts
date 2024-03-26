import { vi } from 'vitest'

const signInWithCredentialsSpy = vi.fn()
const signUpWithCredentialsSpy = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    signInWithCredentials: signInWithCredentialsSpy,
    signUpWithCredentials: signUpWithCredentialsSpy,
  }),
}))
