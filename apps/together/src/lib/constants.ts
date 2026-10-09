const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '')

export const APP_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://together.plotwist.app'
      : 'http://localhost:3001')
)

export const PLOTWIST_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_PLOTWIST_URL || 'https://plotwist.app'
)
