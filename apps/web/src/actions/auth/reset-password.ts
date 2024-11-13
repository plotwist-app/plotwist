'use server'

import { patchUserPassword } from '@/api/users'
import { redirect } from 'next/navigation'

type ResetPassword = {
  token: string
  password: string
}

export async function resetPassword({ password, token }: ResetPassword) {
  const { status } = await patchUserPassword({ token, password })

  if (status === 'password_set') {
    redirect('/sign-in')
  }
}
