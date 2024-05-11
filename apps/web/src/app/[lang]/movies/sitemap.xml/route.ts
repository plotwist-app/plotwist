import { getMoviesIds } from '@/utils/seo/get-movies-ids'
import { Language } from '@plotwist/tmdb'
import { SitemapStream, streamToPromise } from 'sitemap'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const language = pathSegments[0] as Language

  const sitemapStream = new SitemapStream({
    hostname: `https://${url.host}/${language}`,
  })
  const xmlPromise = streamToPromise(sitemapStream)

  const moviesIds = await getMoviesIds()
  moviesIds.forEach((id) => {
    sitemapStream.write({
      url: `/${language}/movies/${id}`,
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
