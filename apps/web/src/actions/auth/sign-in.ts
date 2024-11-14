'use server'

import { postLogin } from '@/api/auth'
import { createSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

type SignInInput = {
  email: string
  password: string
  redirectTo?: string
}

export async function signIn({ email, password, redirectTo }: SignInInput) {
  const { token, status } = await postLogin({ email, password })

  if (token) {
    await createSession({ token })
    redirectTo && redirect(redirectTo)
  }

  return { status }
}
