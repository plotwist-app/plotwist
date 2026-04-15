import { SitemapStream, streamToPromise } from 'sitemap'
import type { Language } from '@/types/languages'

export const dynamic = 'force-dynamic'

const APP_ROUTES = [
  '/',
  '/home',
  '/lists',
  '/movies/discover',
  '/movies/now-playing',
  '/movies/popular',
  '/movies/top-rated',
  '/movies/upcoming',
  '/tv-series/airing-today',
  '/tv-series/discover',
  '/tv-series/on-the-air',
  '/tv-series/popular',
  '/tv-series/top-rated',
  '/animes',
  '/doramas',
  '/pricing',
  '/privacy',
  '/docs',
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const language = pathSegments[0] as Language

  const sitemapStream = new SitemapStream({
    hostname: `https://${url.host}/${language}`,
  })
  const xmlPromise = streamToPromise(sitemapStream)

  for (const route of APP_ROUTES) {
    sitemapStream.write({
      url: `${language}${route}`,
      changefreq: 'daily',
      priority: 0.7,
    })
  }

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
