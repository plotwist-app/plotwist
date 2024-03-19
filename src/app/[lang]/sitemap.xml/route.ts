import { SitemapStream, streamToPromise } from 'sitemap'

export const dynamic = 'force-dynamic'

const APP_ROUTES = [
  '/',
  '/home',
  '/lists',
  '/login',
  '/sign-up',
  '/movies/discover',
  '/movies/now-playing',
  '/movies/popular',
  '/movies/top-rated',
  '/people/popular',
  '/tv-series/airing-today',
  '/tv-series/discover',
  '/tv-series/on-the-air',
  '/tv-series/popular',
  '/tv-series/top-rated',
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const lang = pathSegments[0]

  const sitemapStream = new SitemapStream({
    hostname: `https://${url.host}/${lang}`,
  })

  const xmlPromise = streamToPromise(sitemapStream)

  APP_ROUTES.forEach((route) => {
    sitemapStream.write({
      url: `${lang}${route}`,
      changefreq: 'daily',
      priority: 0.7,
    })
  })

  sitemapStream.end()

  const xml = await xmlPromise
  const xmlString = xml.toString()

  const response = new Response(xmlString, {
    status: 200,
    statusText: 'ok',
  })

  response.headers.append('content-type', 'text/xml')

  return response
}
