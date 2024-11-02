'use client'

import { PostLogin200 } from '@/api/endpoints.schemas'
import { AXIOS_INSTANCE } from '@/services/axios-instance'
import { User } from '@/types/user'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'

type SessionContextProviderProps = PropsWithChildren & {
  initialSession: PostLogin200 | undefined
}

type SessionContext = {
  user: User
}

export const SessionContext = createContext({} as SessionContext)

export const SessionContextProvider = ({
  children,
  initialSession,
}: SessionContextProviderProps) => {
  const [user, setUser] = useState<User>(initialSession?.user)

  useEffect(() => {
    if (initialSession) {
      setUser(initialSession.user)
      AXIOS_INSTANCE.defaults.headers.Authorization = `Bearer ${initialSession.token}`
    }
  }, [initialSession])

  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('SessionContext must be used within SessionContextProvider')
  }

  return context
}
