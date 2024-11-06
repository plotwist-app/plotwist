import 'server-only'

import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { AXIOS_INSTANCE } from '@/services/axios-instance'

export const verifySession = async () => {
  const cookie = cookies().get('session')?.value
  const session = await decrypt(cookie)

  if (session) {
    AXIOS_INSTANCE.defaults.headers.Authorization = `Bearer ${session.token}`
  }

  return session
}
