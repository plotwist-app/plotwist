import { beforeAll, describe, expect, it } from 'vitest'
import dictionary from '../../../../../dictionaries/en-US.json'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from './login-form'
import { useAuth } from '@/hooks/use-auth'

const EMAIL_PLACEHOLDER = 'email@domain.com'
const PASSWORD_PLACEHOLDER = '*********'

describe('LoginForm', () => {
  beforeAll(() => {
    render(<LoginForm dictionary={dictionary} />)
  })

  it('should render correctly', () => {
    expect(screen.getByPlaceholderText(EMAIL_PLACEHOLDER)).toBeTruthy()

    expect(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)).toBeTruthy()
  })

  it('should allow email and password input', async () => {
    const email = screen.getByPlaceholderText(EMAIL_PLACEHOLDER)
    const password = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)

    fireEvent.change(email, { target: { value: 'test@example.com' } })

    fireEvent.change(password, {
      target: { value: 'password123' },
    })

    expect(email).toHaveProperty('value', 'test@example.com')

    expect(password).toHaveProperty('value', 'password123')
  })

  it('should call signInWithCredentials on form submission', async () => {
    const { signInWithCredentials } = useAuth()

    const email = screen.getByPlaceholderText(EMAIL_PLACEHOLDER)
    const password = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)

    const submitButton = screen.getByRole('button', {
      name: dictionary.login_form.access_button,
    })

    fireEvent.change(email, {
      target: { value: 'test@example.com' },
    })

    fireEvent.change(password, {
      target: { value: 'password123' },
    })

    fireEvent.click(submitButton)

    await waitFor(() => expect(signInWithCredentials).toHaveBeenCalled())
  })

  it('should toggle between showing and hiding the password when the icon is clicked', async () => {
    const password = screen.getByPlaceholderText('*********')
    const togglePassword = screen.getByTestId('toggle-password')

    expect(password).toHaveProperty('type', 'password')

    fireEvent.click(togglePassword)
    expect(password).toHaveProperty('type', 'text')

    fireEvent.click(togglePassword)
    expect(password).toHaveProperty('type', 'password')
  })
})
