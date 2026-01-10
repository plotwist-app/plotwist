'use server'

import { redirect } from 'next/navigation'
import { patchUserPassword } from '@/api/users'

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
