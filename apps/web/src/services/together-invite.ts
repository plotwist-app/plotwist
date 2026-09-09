export function buildTogetherInviteUrl(appUrl: string, code: string): string {
  return `${appUrl.replace(/\/+$/, '')}/together/${code.toUpperCase()}`
}
