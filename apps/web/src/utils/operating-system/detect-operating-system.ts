const MAC_OS_PLATFORMS = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
const WINDOWS_PLATFORMS = ['Win32', 'Win64', 'Windows', 'WinCE']
const IOS_PLATFORMS = ['iPhone', 'iPad', 'iPod']

function isPlatformAmong(platform: string, platformsArray: string[]) {
  return platformsArray.includes(platform)
}

export function detectOperatingSystem() {
  if (typeof window === 'undefined') {
    return 'Unknown OS - possibly server-side'
  }

  const userAgent = window?.navigator.userAgent
  const platform = window?.navigator.platform

  if (isPlatformAmong(platform, MAC_OS_PLATFORMS)) {
    return 'Mac OS'
  }

  if (isPlatformAmong(platform, IOS_PLATFORMS)) {
    return 'iOS'
  }

  if (isPlatformAmong(platform, WINDOWS_PLATFORMS)) {
    return 'Windows'
  }

  if (/Android/.test(userAgent)) {
    return 'Android'
  }

  if (/Linux/.test(platform)) {
    return 'Linux'
  }
}
