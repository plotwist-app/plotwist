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
  let token: string | undefined

  try {
    const { data, status } = await postLogin({ login, password })
    token = status === 200 && data && 'token' in data ? data.token : undefined
  } catch {
    return { status: 'invalid_credentials' }
  }

  if (!token) {
    return { status: 'invalid_credentials' }
  }

  await createSession({ token })

  if (redirectTo) {
    redirect(redirectTo)
  }
}
