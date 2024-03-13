import { beforeAll, describe, expect, it } from 'vitest'
import { SignUpForm } from './sign-up-form'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getDictionary } from '@/utils/dictionaries'
import { useAuth } from '@/context/auth'

const USERNAME_PLACEHOLDER = 'JohnDoe'
const EMAIL_PLACEHOLDER = 'email@domain.com'
const PASSWORD_PLACEHOLDER = '*********'

describe('SignUpForm', () => {
  beforeAll(async () => {
    const dictionary = await getDictionary('en-US')
    render(<SignUpForm dictionary={dictionary} />)
  })

  it('should render correctly', () => {
    expect(screen.getByPlaceholderText(USERNAME_PLACEHOLDER)).toBeTruthy()

    expect(screen.getByPlaceholderText(EMAIL_PLACEHOLDER)).toBeTruthy()

    expect(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)).toBeTruthy()
  })

  it('should allow username, email, and password input', async () => {
    const username = screen.getByPlaceholderText(USERNAME_PLACEHOLDER)
    const email = screen.getByPlaceholderText(EMAIL_PLACEHOLDER)
    const password = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)

    fireEvent.change(username, { target: { value: 'JohnDoe123' } })
    fireEvent.change(email, { target: { value: 'john@example.com' } })
    fireEvent.change(password, { target: { value: 'password123' } })

    expect(username).toHaveProperty('value', 'JohnDoe123')

    expect(email).toHaveProperty('value', 'john@example.com')

    expect(password).toHaveProperty('value', 'password123')
  })

  it('should call signUpWithCredentials on form submission', async () => {
    const { signUpWithCredentials } = useAuth()
    const dictionary = await getDictionary('en-US')

    const email = screen.getByPlaceholderText(EMAIL_PLACEHOLDER)
    const password = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)
    const username = screen.getByPlaceholderText(USERNAME_PLACEHOLDER)

    const submitButton = screen.getByRole('button', {
      name: dictionary.sign_up_form.submit_button,
    })

    fireEvent.change(username, { target: { value: 'JohnDoe123' } })
    fireEvent.change(email, { target: { value: 'john@example.com' } })
    fireEvent.change(password, { target: { value: 'password123' } })

    fireEvent.click(submitButton)

    await waitFor(() =>
      expect(signUpWithCredentials).toHaveBeenCalledWith({
        username: 'JohnDoe123',
        email: 'john@example.com',
        password: 'password123',
      }),
    )
  })

  it('should toggle between showing and hiding the password when the icon is clicked', async () => {
    const passwordInput = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)
    const togglePasswordButton = screen.getByTestId('toggle-password')

    expect(passwordInput).toHaveProperty('type', 'password')

    fireEvent.click(togglePasswordButton)

    expect(passwordInput).toHaveProperty('type', 'text')

    fireEvent.click(togglePasswordButton)

    expect(passwordInput).toHaveProperty('type', 'password')
  })
})
