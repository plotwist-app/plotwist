'use client'

import { createContext, PropsWithChildren, useContext, useState } from 'react'

type Session = {
  user: unknown
} | null

type SessionContextProviderProps = PropsWithChildren & {
  initialSession: Session
}

type SessionContext = {
  session: Session | null
}

export const SessionContext = createContext({} as SessionContext)

export const SessionContextProvider = ({
  children,
  initialSession,
}: SessionContextProviderProps) => {
  const [session] = useState<Session>(initialSession)

  return (
    <SessionContext.Provider value={{ session }}>
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
