'use server'

import { redirect } from 'next/navigation'
import { postLogin } from '@/api/auth'
import { createSession } from '@/app/lib/session'

type SignInInput = {
  login: string
  password: string
  redirectTo?: string
}

export async function signIn({ login, password, redirectTo }: SignInInput) {
  const { token, status } = await postLogin({ login, password })

  if (token) {
    await createSession({ token })

    if (redirectTo) {
      redirect(redirectTo)
    }
  }

  return { status }
}
