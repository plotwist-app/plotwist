import { SUPPORTED_LANGUAGES } from '../../languages'
import { APP_URL } from '../../constants'
import { getMoviesPagesIds } from '@/utils/seo/get-movies-pages-ids'
import { getTvSeriesPagesIds } from '@/utils/seo/get-tv-series-pages-ids'

export const APP_ROUTES = [
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

export default async function sitemap() {
  const movieRoutes = await Promise.all(
    SUPPORTED_LANGUAGES.map(async (language) => {
      const movieIds = await getMoviesPagesIds(language.value)

      return movieIds.map((id) => ({
        url: `${APP_URL}/${language.value}/movies/${id}`,
        lastModified: new Date().toISOString(),
      }))
    }),
  )

  const tvSeriesRoutes = await Promise.all(
    SUPPORTED_LANGUAGES.map(async (language) => {
      const tvSeriesIds = await getTvSeriesPagesIds(language.value)

      return tvSeriesIds.map((id) => ({
        url: `${APP_URL}/${language.value}/tv-series/${id}`,
        lastModified: new Date().toISOString(),
      }))
    }),
  )

  const staticRoutes = SUPPORTED_LANGUAGES.flatMap((language) =>
    APP_ROUTES.map((route) => ({
      url: `${APP_URL}/${language.value}${route}`,
      lastModified: new Date().toISOString(),
    })),
  )

  return [
    ...staticRoutes,
    ...movieRoutes.flatMap((routes) => routes),
    ...tvSeriesRoutes.flatMap((routes) => routes),
  ]
}
