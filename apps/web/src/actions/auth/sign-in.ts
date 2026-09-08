'use server'

import { redirect } from 'next/navigation'
import { postLogin } from '@/api/auth'
import { getMe } from '@/api/users'
import { createSession } from '@/app/lib/session'
import { setAuthToken } from '@/services/api-client'
import { asLanguage, type Language } from '@/types/languages'
import { getSafeLocalizedRedirectPath } from '@/utils/auth-redirect'

type SignInInput = {
  login: string
  password: string
  language: Language
  redirectTo?: string
}

export async function signIn({
  login,
  password,
  language,
  redirectTo,
}: SignInInput) {
  const safeLanguage = asLanguage(language)
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

  let finalRedirectTo =
    redirectTo === undefined
      ? undefined
      : (getSafeLocalizedRedirectPath(redirectTo, safeLanguage) ??
        `/${safeLanguage}/home`)

  try {
    setAuthToken(token)
    const { data } = await getMe()

    if (data?.user && !data.user.displayName) {
      finalRedirectTo = `/${safeLanguage}/onboarding`
    }
  } catch (error) {
    console.error(
      'Failed to fetch user during sign in for onboarding check',
      error
    )
  }

  if (finalRedirectTo) {
    redirect(finalRedirectTo)
  }
}
