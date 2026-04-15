import { SitemapStream, streamToPromise } from 'sitemap'
import type { Language } from '@/services/tmdb'
import { getTvSeriesIds } from '@/utils/seo/get-tv-series-ids'

// Cache sitemap for 24 hours to avoid excessive TMDB API calls
export const revalidate = 86400

// Limit function execution time to 30 seconds
export const maxDuration = 30

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const language = pathSegments[0] as Language

  const sitemapStream = new SitemapStream({
    hostname: `https://${url.host}/${language}`,
  })
  const xmlPromise = streamToPromise(sitemapStream)

  const tvSeriesIds = await getTvSeriesIds()

  for (const tvSerieId of tvSeriesIds) {
    sitemapStream.write({
      url: `/${language}/tv-series/${tvSerieId}`,
      changefreq: 'weekly',
      lastmodISO: new Date().toISOString(),
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
