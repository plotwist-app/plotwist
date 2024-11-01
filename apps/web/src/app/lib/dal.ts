import 'server-only'

import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { PostLogin200User } from '@/api/endpoints.schemas'

export const verifySession = async () => {
  const cookie = cookies().get('session')?.value
  console.log({ cookie })
  const session = await decrypt(cookie)

  return { user: session ? (session.user as PostLogin200User) : null }
}
