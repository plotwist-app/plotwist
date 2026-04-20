const KNOWN_CRAWLER_UA_PATTERN =
  /(googlebot|bingbot|duckduckbot|slurp|baiduspider|yandexbot|applebot|petalbot|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot)/i

const BLOCKED_TRAFFIC_COUNTRIES = new Set(
  (process.env.BLOCKED_TRAFFIC_COUNTRIES ?? 'SG')
    .split(',')
    .map(country => country.trim().toUpperCase())
    .filter(Boolean)
)

type TrafficGuardOptions = {
  country?: string | null
  userAgent?: string | null
  allowKnownCrawlers?: boolean
}

export function shouldBlockTraffic({
  country,
  userAgent,
  allowKnownCrawlers = false,
}: TrafficGuardOptions): boolean {
  const normalizedCountry = country?.trim().toUpperCase()

  if (!normalizedCountry) {
    return false
  }

  if (!BLOCKED_TRAFFIC_COUNTRIES.has(normalizedCountry)) {
    return false
  }

  if (allowKnownCrawlers && userAgent && KNOWN_CRAWLER_UA_PATTERN.test(userAgent)) {
    return false
  }

  return true
}
