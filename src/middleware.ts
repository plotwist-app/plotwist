import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales } from '../locales'

const headers = { 'accept-language': 'en-US,en;q=0.5' }
const languages = new Negotiator({ headers }).languages()
const defaultLocale = 'en-US'
match(languages, locales, defaultLocale)

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ['/app'],
}
