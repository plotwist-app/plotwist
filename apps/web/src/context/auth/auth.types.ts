import { PostUsersCreateBody } from '@/api/endpoints.schemas'
import { PropsWithChildren } from 'react'

export type Credentials = PostUsersCreateBody

export type AuthContextType = {
  signUp: (params: Credentials) => Promise<void>
}

export type AuthContextProviderProps = PropsWithChildren
