'use client'

import { createContext, useContext, useState } from 'react'
import { AuthContext, AuthContextProviderProps } from './auth.types'
import { toast } from 'sonner'

import { useLanguage } from '../language'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Profile } from '@/types/supabase'

export const authContext = createContext({} as AuthContext)

export const AuthContextProvider = ({
  children,
  initialUser,
}: AuthContextProviderProps) => {
  const [user, setUser] = useState<Profile | null>(initialUser)
  const { dictionary } = useLanguage()
  const supabase = createClientComponentClient()

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message, {
        action: {
          label: dictionary.sign_up_form.try_again,
          onClick: () => logout(),
        },
      })

      return
    }

    toast.success(dictionary.auth.logout_success)
    setUser(null)
  }

  async function signInWithOTP(email: string) {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000',
      },
    })
  }

  return (
    <authContext.Provider
      value={{
        user,
        signInWithOTP,
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(authContext)

  if (!context) {
    throw new Error('ListsContext must be used within ListsContextProvider')
  }

  return context
}
