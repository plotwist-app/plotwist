import 'server-only'

import { cookies } from 'next/headers'
import { getMe } from '@/api/users'
import { decrypt } from '@/app/lib/session'
import { setAuthToken } from '@/services/api-client'

export const verifySession = async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (session) {
    setAuthToken(session.token ?? null)

    try {
      const { data } = await getMe()
      return { token: session.token, user: data?.user }
    } catch {
      return undefined
    }
  }

  return undefined
}
