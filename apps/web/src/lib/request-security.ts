import type { NextRequest } from 'next/server'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  expiresAt: number
}

const GLOBAL_RATE_LIMIT_KEY = '__plotwistRateLimitStore__'

function getStore(): Map<string, RateLimitEntry> {
  const globalState = globalThis as typeof globalThis & {
    [GLOBAL_RATE_LIMIT_KEY]?: Map<string, RateLimitEntry>
  }

  if (!globalState[GLOBAL_RATE_LIMIT_KEY]) {
    globalState[GLOBAL_RATE_LIMIT_KEY] = new Map<string, RateLimitEntry>()
  }

  return globalState[GLOBAL_RATE_LIMIT_KEY]
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }

  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  )
}

export function buildRateLimitKey(request: NextRequest, route: string): string {
  return `${route}:${getClientIp(request)}`
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): {
  allowed: boolean
  retryAfterSeconds: number
} {
  const now = Date.now()
  const store = getStore()
  const entry = store.get(key)

  if (!entry || entry.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    })

    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((entry.expiresAt - now) / 1000)
    )
    return { allowed: false, retryAfterSeconds }
  }

  entry.count += 1
  store.set(key, entry)

  return { allowed: true, retryAfterSeconds: 0 }
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const requestOrigin = request.nextUrl.origin
  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')
  const secFetchSite = request.headers.get('sec-fetch-site')

  if (originHeader === requestOrigin) {
    return true
  }

  if (refererHeader) {
    try {
      if (new URL(refererHeader).origin === requestOrigin) {
        return true
      }
    } catch {
      return false
    }
  }

  return secFetchSite === 'same-origin' || secFetchSite === 'same-site'
}
