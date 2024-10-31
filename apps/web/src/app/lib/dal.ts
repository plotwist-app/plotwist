import 'server-only'

import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'

export const verifySession = async () => {
  const cookie = await cookies().get('session')?.value
  const session = await decrypt(cookie)

  console.log({ session })
}

export const getUser = async () => {
  const session = await verifySession()
  console.log({ session })
}
