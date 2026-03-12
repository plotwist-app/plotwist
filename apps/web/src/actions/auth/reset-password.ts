'use server'

import { redirect } from 'next/navigation'
import { patchUserPassword } from '@/api/users'

type ResetPassword = {
  token: string
  password: string
}

export async function resetPassword({ password, token }: ResetPassword) {
  try {
    const res = await patchUserPassword({ token, password })
    if (res.status !== 200) {
      return { error: 'reset_password_error' }
    }
  } catch {
    return { error: 'reset_password_error' }
  }

  redirect('/sign-in')
}
