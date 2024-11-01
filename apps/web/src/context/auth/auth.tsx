'use client'

import { createContext, useContext } from 'react'
import {
  AuthContext,
  AuthContextProviderProps,
  Credentials,
  type ResetPasswordProps,
} from './auth.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { useLanguage } from '../language'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { APP_URL } from '../../../constants'
import { postUsersCreate } from '@/api/users'

export const authContext = createContext({} as AuthContext)

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const { dictionary, language } = useLanguage()
  const supabase = createClientComponentClient()
  const { push } = useRouter()

  const signUp = async (credentials: Credentials) => {
    try {
      await postUsersCreate({ ...credentials })
      toast.success(dictionary.sign_up_form.sign_up_success)
      push(`/${language}/sign-in`)
    } catch {
      toast.error('Não foi possível realizar o cadastro.')
    }
  }

  const logout = async () => {
    // const { error } = await supabase.auth.signOut()
    // if (error) {
    //   toast.error(error.message, {
    //     action: {
    //       label: dictionary.sign_up_form.try_again,
    //       onClick: () => logout(),
    //     },
    //   })
    //   return
    // }
    // toast.success(dictionary.auth.logout_success)
    // setUser(null)
  }

  const requestPasswordReset = async ({
    email,
  }: Omit<Credentials, 'username' | 'password'>) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/${language}/reset-password`,
    })

    toast.success(dictionary.request_password_reset_form_response) // we have only one response, because we don't want to expose the email existence for a potencial BruteForce attack
  }

  const resetPassword = async ({ code, password }: ResetPasswordProps) => {
    const { error: verifyOtpError } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: code,
    })

    if (verifyOtpError) {
      toast.error(dictionary.invalid_reset_password_code)

      return
    }

    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password,
    })

    if (updatePasswordError) {
      toast.error(dictionary.unexpected_error)

      return
    }

    toast.success(dictionary.reset_password_success)

    push(`/${language}/sign-in`)
  }

  return (
    <authContext.Provider
      value={{
        signUp,
        logout,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </authContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(authContext)

  if (!context) {
    throw new Error('AuthContext must be used within AuthContextProvider')
  }

  return context
}
