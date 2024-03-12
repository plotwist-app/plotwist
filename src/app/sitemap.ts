import { SUPPORTED_LANGUAGES } from '../../languages'
import { APP_URL } from '../../constants'

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

export default function sitemap() {
  const routes = SUPPORTED_LANGUAGES.map((language) =>
    APP_ROUTES.map((route) => {
      return {
        url: `${APP_URL}/${language.value}${route}`,
        lastModified: new Date().toISOString(),
      }
    }),
  ).flatMap((language) => language)

  return routes
}
