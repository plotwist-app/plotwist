import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SignInForm } from './_sign-in-form'

const mocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.success,
    error: mocks.error,
  },
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'pt-BR',
    dictionary: {
      login_required: 'Login is required.',
      password_required: 'Password is required.',
      password_length: 'Password is too short.',
      login_label: 'Login',
      login_placeholder: 'you@example.com',
      password_label: 'Password',
      access_button: 'Access',
      login_form: {
        login_success: 'Welcome!',
        invalid_login_credentials: 'Invalid credentials.',
        show_password: 'Show password',
        hide_password: 'Hide password',
      },
      legacy_user: {
        title: 'Reset password',
        description: 'Reset required.',
        agree: 'OK',
      },
    },
  }),
}))

describe('SignInForm redirect behavior', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('submits the safe redirect supplied by the sign-in page', async () => {
    const onSignIn = vi.fn().mockResolvedValue({ status: '' })

    render(<SignInForm onSignIn={onSignIn} redirectTo="/pt-BR/together" />)

    fireEvent.change(screen.getByLabelText('Login'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('*********'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Access' }))

    await waitFor(() =>
      expect(onSignIn).toHaveBeenCalledWith({
        login: 'ana@example.com',
        password: 'password123',
        language: 'pt-BR',
        redirectTo: '/pt-BR/together',
      })
    )
  })
})
