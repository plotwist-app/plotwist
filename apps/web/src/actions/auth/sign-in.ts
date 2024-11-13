'use server'

import { postLogin } from '@/api/auth'
import { createSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

type SignInCredentials = {
  email: string
  password: string
}

export async function signIn(credentials: SignInCredentials) {
  const { email, password } = credentials

  const { token, status } = await postLogin({ email, password })

  if (token) {
    await createSession({ token })
    redirect('/home')
  }

  return { status }
}
