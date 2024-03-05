import { User } from '@supabase/supabase-js'
import { ReactNode } from 'react'

export type AuthContext = {
  user: User | null
  signInWithCredentials: (credentials: SignInCredentials) => Promise<void>
  signUpWithCredentials: ({
    username,
    ...credentials
  }: SignUpCredentials) => Promise<void>
  logout: () => Promise<void>
}

export type AuthContextProviderProps = {
  children: ReactNode
  initialUser: User | null
}

export type SignInCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = {
  email: string
  password: string
  username: string
}
