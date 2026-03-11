import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { type NextRequest, NextResponse } from 'next/server'
import { languages as appLanguages } from '../languages'

const headers = { 'accept-language': 'en-US' }
const languages = new Negotiator({ headers }).languages()

const DEFAULT_LOCALE = 'en-US'

match(languages, appLanguages, DEFAULT_LOCALE)

// Single-segment path with 4–10 alphanumeric chars (no hyphens → won't match lang codes like en-US)
const SHORT_CODE_RE = /^\/[a-zA-Z0-9]{4,10}$/

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rewrite short code paths to the internal API resolver.
  // No fetch in Edge — the Node.js API route handles backend communication.
  if (SHORT_CODE_RE.test(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = `/api/r${pathname}`
    return NextResponse.rewrite(url)
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
