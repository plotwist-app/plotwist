'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { postLogin } from '@/api/auth'
import { getMe } from '@/api/users'
import { createSession } from '@/app/lib/session'
import { setAuthToken } from '@/services/api-client'

type SignInInput = {
  login: string
  password: string
  redirectTo?: string
}

function getLocaleFromRedirectTo(redirectTo?: string) {
  if (!redirectTo) return null

  const locale = redirectTo.split('/').filter(Boolean)[0]
  const isValidLocale = /^[a-z]{2}-[A-Z]{2}$/.test(locale ?? '')

  return isValidLocale ? locale : null
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
    setAuthToken(token)
    const { data } = await getMe()

    if (data?.user && !data.user.displayName) {
      const cookieStore = await cookies()
      const localeFromRedirect = getLocaleFromRedirectTo(redirectTo)
      const lang =
        localeFromRedirect ||
        cookieStore.get('NEXT_LOCALE')?.value ||
        cookieStore.get('i18next')?.value ||
        'en-US'
      finalRedirectTo = `/${lang}/onboarding`
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
