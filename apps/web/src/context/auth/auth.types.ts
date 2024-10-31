import { PostUsersCreateBody } from '@/api/endpoints.schemas'
import { Profile } from '@/types/supabase'
import { ReactNode } from 'react'

export type Credentials = PostUsersCreateBody

export type AuthContext = {
  user: Profile | null
  signUp: (params: Credentials) => Promise<void>

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

export interface ResetPasswordProps
  extends Omit<Credentials, 'username' | 'email'> {
  code: string
}
