export const UI_VERSION_COOKIE_NAME = 'plotwist-ui'
export type UiVersion = 'classic' | 'cinematic'

export function parseUiVersion(value: string | null | undefined): UiVersion {
  return value === 'cinematic' ? 'cinematic' : 'classic'
}

export function readUiVersionCookie(cookieHeader: string): UiVersion {
  const prefix = `${UI_VERSION_COOKIE_NAME}=`
  const value = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(prefix))
    ?.slice(prefix.length)

  return parseUiVersion(value)
}

export function serializeUiVersionCookie(value: UiVersion): string {
  return `${UI_VERSION_COOKIE_NAME}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
}
