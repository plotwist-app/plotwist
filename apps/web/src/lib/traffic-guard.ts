const KNOWN_CRAWLER_UA_PATTERN =
  /(googlebot|bingbot|duckduckbot|slurp|baiduspider|yandexbot|applebot|petalbot|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot)/i

const SUSPICIOUS_UA_PATTERN =
  /(curl|wget|python-requests|python-urllib|go-http-client|java\/|libwww-perl|okhttp|postmanruntime|insomnia|headless|phantomjs|scrapy|nikto|nmap|sqlmap|masscan|zgrab)/i

const BLOCKED_TRAFFIC_COUNTRIES = new Set(['SG'])

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
  const knownCrawler = Boolean(userAgent && KNOWN_CRAWLER_UA_PATTERN.test(userAgent))

  if (allowKnownCrawlers && knownCrawler) {
    return false
  }

  if (normalizedCountry && BLOCKED_TRAFFIC_COUNTRIES.has(normalizedCountry)) {
    return true
  }

  // Requests without UA or with known scripted signatures are almost always
  // automated abuse, and they are a major source of avoidable edge/function costs.
  if (!userAgent) {
    return true
  }

  if (SUSPICIOUS_UA_PATTERN.test(userAgent)) {
    return true
  }

  return false
}
