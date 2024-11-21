import type { Language } from '@/types/languages'
import { SitemapStream, streamToPromise } from 'sitemap'

export const dynamic = 'force-dynamic'

const APP_ROUTES = [
  '/',
  '/home',
  '/lists',
  '/sign-in',
  '/sign-up',
  '/movies/discover',
  '/movies/now-playing',
  '/movies/popular',
  '/movies/top-rated',
  '/tv-series/airing-today',
  '/tv-series/discover',
  '/tv-series/on-the-air',
  '/tv-series/popular',
  '/tv-series/top-rated',
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
