import { type NextRequest, NextResponse } from 'next/server'
import { detectRequestLocale } from '@/lib/request-locale'
import { LANGUAGES } from '@/types/languages'

function hasLocalePrefix(pathname: string) {
  return LANGUAGES.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next()
  }

  const locale = detectRequestLocale(req.headers.get('accept-language'))
  const url = req.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
