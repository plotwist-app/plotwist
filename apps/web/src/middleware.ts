import { NextRequest, NextResponse } from 'next/server'

import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { languages as appLanguages } from '../languages'

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

  // const user = await getUserService()

  // const isPathnameOnlyLocale = appLanguages.some(
  //   (locale) => pathname === `/${locale}`,
  // )

  // const authPathnames = [
  //   '/login',
  //   '/sign-up',
  //   '/forgot-password',
  //   '/reset-password',
  // ]

  // const strippedPathname = pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '')

  // const isAuthPathname = authPathnames.includes(strippedPathname)

  // if ((isPathnameOnlyLocale || isAuthPathname) && user) {
  //   return NextResponse.redirect(req.nextUrl.origin + `/${language}/home`)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
