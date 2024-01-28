import { beforeAll, describe, expect, it, vi } from 'vitest'
import dictionary from '../../../../../dictionaries/en-US.json'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from './login-form'
import { useAuth } from '@/hooks/use-auth'

const signInWithCredentialsSpy = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    signInWithCredentials: signInWithCredentialsSpy,
  }),
}))

describe('LoginForm', () => {
  beforeAll(() => {
    render(<LoginForm dictionary={dictionary} />)
  })

  it('should render correctly', () => {
    expect(screen.getByPlaceholderText('email@domain.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('*********')).toBeTruthy()
  })

  it('should allow email and password input', async () => {
    const userEmail = screen.getByPlaceholderText('email@domain.com')
    const userPassword = screen.getByPlaceholderText('*********')

    fireEvent.change(userEmail, { target: { value: 'test@example.com' } })

    fireEvent.change(userPassword, {
      target: { value: 'password123' },
    })

    expect(userEmail).toHaveProperty('value', 'test@example.com')

    expect(userPassword).toHaveProperty('value', 'password123')
  })

  it('should call signInWithCredentials on form submission', async () => {
    const { signInWithCredentials } = useAuth()

    const userEmail = screen.getByPlaceholderText('email@domain.com')
    const userPassword = screen.getByPlaceholderText('*********')

    const submitButton = screen.getByRole('button', {
      name: dictionary.login_form.access_button,
    })

    fireEvent.change(userEmail, {
      target: { value: 'test@example.com' },
    })

    fireEvent.change(userPassword, {
      target: { value: 'password123' },
    })

    fireEvent.click(submitButton)

    await waitFor(() => expect(signInWithCredentials).toHaveBeenCalled())
  })

  it('should toggle between showing and hiding the password when the icon is clicked', async () => {
    const passwordInput = screen.getByPlaceholderText('*********')
    const togglePasswordButton = screen.getByTestId('toggle-password')

    expect(passwordInput).toHaveProperty('type', 'password')

    fireEvent.click(togglePasswordButton)
    expect(passwordInput).toHaveProperty('type', 'text')

    fireEvent.click(togglePasswordButton)
    expect(passwordInput).toHaveProperty('type', 'password')
  })
})
