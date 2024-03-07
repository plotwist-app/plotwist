import { MetadataRoute } from 'next'
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
  '/tv-shows/airing-today',
  '/tv-shows/discover',
  '/tv-shows/on-the-air',
  '/tv-shows/popular',
  '/tv-shows/top-rated',
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
