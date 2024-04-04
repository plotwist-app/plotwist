import { Profile } from '@/types/supabase'
import { ReactNode } from 'react'

export type AuthContext = {
  user: Profile | null
  signInWithCredentials: (credentials: SignInCredentials) => Promise<void>
  signUpWithCredentials: ({
    username,
    ...credentials
  }: SignUpCredentials) => Promise<void>
  logout: () => Promise<void>
}

export type AuthContextProviderProps = {
  children: ReactNode
  initialUser: Profile | null
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
