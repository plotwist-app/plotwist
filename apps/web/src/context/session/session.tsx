'use client'

import { verifySession } from '@/app/lib/dal'
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

  useEffect(() => {
    if (!initialSession) {
      setUser(null)
      AXIOS_INSTANCE.defaults.headers.Authorization = ''

      return
    }

    setUser(initialSession.user)
    AXIOS_INSTANCE.defaults.headers.Authorization = `Bearer ${initialSession.token}`
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
