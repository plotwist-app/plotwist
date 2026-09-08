import { type NextRequest, NextResponse } from 'next/server'
import { detectRequestLocale } from '@/lib/request-locale'
import { shouldBlockTraffic } from '@/lib/traffic-guard'
import { languages as appLanguages } from '../languages'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const country =
    req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry')
  const userAgent = req.headers.get('user-agent')

  if (shouldBlockTraffic({ country, userAgent, allowKnownCrawlers: true })) {
    return new NextResponse(null, {
      status: 403,
      headers: {
        'cache-control': 'public, max-age=300, s-maxage=300',
      },
    })
  }

  // Short URLs (/s/1Tu4V) are handled by app/s/[shortCode]/page.tsx which serves
  // OG metadata for social bots and a JS redirect for real users.
  if (pathname.startsWith('/s/')) {
    return NextResponse.next()
  }

  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-current-path', pathname)

  const language = detectRequestLocale(req.headers.get('accept-language'))

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
