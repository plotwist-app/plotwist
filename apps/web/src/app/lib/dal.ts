import 'server-only'

import { getMe } from '@/api/users'
import { decrypt } from '@/app/lib/session'
import { AXIOS_INSTANCE } from '@/services/axios-instance'
import { cookies } from 'next/headers'

export const verifySession = async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (session) {
    AXIOS_INSTANCE.defaults.headers.Authorization = `Bearer ${session.token}`

    try {
      const { user } = await getMe()
      return { token: session.token, user }
    } catch {
      return undefined
    }
  }

  return undefined
}
