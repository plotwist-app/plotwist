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

  let finalRedirectTo = redirectTo

  try {
    // Import dynamically or ensure 'setAuthToken' and 'getMe' are available
    const { setAuthToken } = await import('@/services/api-client')
    const { getMe } = await import('@/api/users')
    
    setAuthToken(token)
    const { data } = await getMe()
    
    if (data?.user && !data.user.displayName) {
      if (redirectTo) {
        const parts = redirectTo.split('/')
        const lang = parts[1] || 'en-US'
        finalRedirectTo = `/${lang}/onboarding`
      }
    }
  } catch (error) {
    console.error('Failed to fetch user during sign in for onboarding check', error)
  }

  if (finalRedirectTo) {
    redirect(finalRedirectTo)
  }
}
