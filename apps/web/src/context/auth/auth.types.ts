import { Profile } from '@/types/supabase'
import { ReactNode } from 'react'

export type AuthContext = {
  user: Profile | null

  signInWithCredentials: (
    credentials: Omit<Credentials, 'username'>,
  ) => Promise<void>

  signUpWithCredentials: (credentials: Credentials) => Promise<void>

  logout: () => Promise<void>

  requestPasswordReset: (
    credentials: Omit<Credentials, 'username' | 'password'>,
  ) => Promise<void>

  resetPassword: (credentials: ResetPasswordProps) => Promise<void>
}

export type AuthContextProviderProps = {
  children: ReactNode
  initialUser: Profile | null
}

export type Credentials = {
  email: string
  password: string
  username: string
}

export interface ResetPasswordProps
  extends Omit<Credentials, 'username' | 'email'> {
  code: string
}
