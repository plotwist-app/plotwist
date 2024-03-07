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
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: 'https://acme.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://acme.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://acme.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  const routes = SUPPORTED_LANGUAGES.map((language) =>
    APP_ROUTES.map((route) => {
      return {
        url: `${APP_URL}/${language.value}${route}`,
        lastModified: new Date().toISOString(),
      }
    }),
  ).flatMap((language) => language)

  return sitemap
}
