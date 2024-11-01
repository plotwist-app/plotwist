'use client'

import { createContext, PropsWithChildren, useContext, useState } from 'react'

type Session = {
  user: unknown
}

type SessionContextProviderProps = PropsWithChildren & {
  initialSession: Session
}

export const SessionContext = createContext({})
export const SessionContextProvider = ({
  children,
  initialSession,
}: SessionContextProviderProps) => {
  const [session] = useState<Session | null>(initialSession)

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
