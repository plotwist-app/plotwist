import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { type NextRequest, NextResponse } from 'next/server'
import { languages as appLanguages } from '../languages'

const headers = { 'accept-language': 'en-US' }
const languages = new Negotiator({ headers }).languages()

const DEFAULT_LOCALE = 'en-US'

match(languages, appLanguages, DEFAULT_LOCALE)

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Short URLs (/s/1Tu4V) are handled by app/s/[shortCode]/page.tsx which serves
  // OG metadata for social bots and a JS redirect for real users.
  if (pathname.startsWith('/s/')) {
    return NextResponse.next()
  }

  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-current-path', pathname)

  const browserLanguage =
    req.headers.get('accept-language')?.split(',')[0] ?? 'en'

  const language =
    appLanguages.find(language => language.startsWith(browserLanguage)) ??
    DEFAULT_LOCALE

  const pathnameHasLocale = appLanguages.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    req.nextUrl.pathname = `/${language}${pathname}`
    return NextResponse.redirect(req.nextUrl)
  }

  return NextResponse.next({ headers: reqHeaders })
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
