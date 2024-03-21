import { Language } from '@/types/languages'
import { getMoviesPagesIds } from '@/utils/seo/get-movies-pages-ids'
import { getTvSeriesPagesIds } from '@/utils/seo/get-tv-series-pages-ids'
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
  const language = pathSegments[0] as Language

  const [movieIds, tvSeriesIds] = await Promise.all([
    getMoviesPagesIds(language),
    getTvSeriesPagesIds(language),
  ])

  const sitemapStream = new SitemapStream({
    hostname: `https://${url.host}/${language}`,
  })

  const xmlPromise = streamToPromise(sitemapStream)

  APP_ROUTES.forEach((route) => {
    sitemapStream.write({
      url: `${language}${route}`,
      changefreq: 'daily',
      priority: 0.7,
    })
  })

  movieIds.forEach((id) => {
    sitemapStream.write({
      url: `/${language}/movies/${id}`,
      changefreq: 'weekly',
      lastmodISO: new Date().toISOString(),
    })
  })

  tvSeriesIds.forEach((id) => {
    sitemapStream.write({
      url: `/${language}/tv-series/${id}`,
      changefreq: 'weekly',
      lastmodISO: new Date().toISOString(),
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
