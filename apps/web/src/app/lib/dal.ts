import 'server-only'

import { cookies } from 'next/headers'
import { getMe } from '@/api/users'
import { decrypt } from '@/app/lib/session'
import { setAuthToken } from '@/services/axios-instance'

export const verifySession = async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (session) {
    setAuthToken(session.token ?? null)

    try {
      const { user } = await getMe()
      return { token: session.token, user }
    } catch {
      return undefined
    }
  }

  return undefined
}
