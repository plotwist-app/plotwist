'use client'

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { verifySession } from '@/app/lib/dal'
import { setAuthToken } from '@/services/axios-instance'
import type { User } from '@/types/user'

type SessionContextProviderProps = PropsWithChildren & {
  initialSession: Awaited<ReturnType<typeof verifySession>>
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

  setAuthToken(initialSession?.token ?? null)

  useEffect(() => {
    if (!initialSession) {
      setUser(undefined)
      setAuthToken(null)
      return
    }

    setUser(initialSession.user)
    setAuthToken(initialSession.token ?? null)
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
