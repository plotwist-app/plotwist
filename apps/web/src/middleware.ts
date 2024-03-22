import { NextRequest, NextResponse } from 'next/server'

import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { languages as appLanguages } from '../languages'

const headers = { 'accept-language': 'en-US' }
const languages = new Negotiator({ headers }).languages()
const defaultLocale = 'en-US'
match(languages, appLanguages, defaultLocale)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const pathnameHasLocale = appLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (!pathnameHasLocale) {
    req.nextUrl.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(req.nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
