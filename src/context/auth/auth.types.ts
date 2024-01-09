import { User } from '@supabase/supabase-js'
import { ReactNode } from 'react'

export type AuthContext = {
  user: User
}

export type AuthContextProviderProps = {
  children: ReactNode
  user: User
}
