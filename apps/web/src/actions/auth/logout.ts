'use server'

import { Language } from '@plotwist_app/tmdb'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout(language: Language) {
  cookies().delete('session')
  redirect(`/${language}/sign-in`)
}
