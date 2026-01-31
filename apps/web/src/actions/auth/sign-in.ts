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
  const response = await postLogin({ login, password })

  if (response.status === 200 && response.data.token) {
    await createSession({ token: response.data.token })

    if (redirectTo) {
      redirect(redirectTo)
    }
  }

  return { status: response.status === 200 ? response.data.status : undefined }
}
