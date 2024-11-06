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

  const { token } = await postLogin({ email, password })
  await createSession({ token })

  redirect('/home')
}
