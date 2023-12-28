import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Any Server Component route that uses a Supabase client must be added to this
 * middleware's `matcher` array. Without this, the Server Component may try to make a
 * request to Supabase with an expired `access_token`.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ['/app'],
}
