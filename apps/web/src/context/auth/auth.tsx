'use client'

import { createContext, useContext } from 'react'
import {
  AuthContextType,
  AuthContextProviderProps,
  Credentials,
} from './auth.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { useLanguage } from '../language'
import { postUsersCreate } from '@/api/users'

export const AuthContext = createContext({} as AuthContextType)

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const { dictionary, language } = useLanguage()
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

  return (
    <AuthContext.Provider
      value={{
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('AuthContext must be used within AuthContextProvider')
  }

  return context
}
