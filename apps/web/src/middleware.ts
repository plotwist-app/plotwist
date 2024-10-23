import { NextRequest, NextResponse } from 'next/server'

import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { languages as appLanguages } from '../languages'
import { getUserService } from './services/api/users/get-user'

const headers = { 'accept-language': 'en-US' }
const languages = new Negotiator({ headers }).languages()

const DEFAULT_LOCALE = 'en-US'

match(languages, appLanguages, DEFAULT_LOCALE)

export async function middleware(req: NextRequest) {
  const browserLanguage =
    req.headers.get('accept-language')?.split(',')[0] ?? 'en'

  const language =
    appLanguages.find((language) => language.startsWith(browserLanguage)) ??
    DEFAULT_LOCALE

  const { pathname } = req.nextUrl

  const pathnameHasLocale = appLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (!pathnameHasLocale) {
    req.nextUrl.pathname = `/${language}${pathname}`
    return NextResponse.redirect(req.nextUrl)
  }

  const user = await getUserService()

  const isPathnameOnlyLocale = appLanguages.some(
    (locale) => pathname === `/${locale}`,
  )

  if (isPathnameOnlyLocale && user) {
    return NextResponse.redirect(`${req.nextUrl}/home`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
