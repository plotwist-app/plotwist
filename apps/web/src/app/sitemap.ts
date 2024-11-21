import type { MetadataRoute } from 'next'
import { APP_URL } from '../../constants'
import { SUPPORTED_LANGUAGES } from '../../languages'

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemaps = SUPPORTED_LANGUAGES.flatMap(language => [
    {
      url: `${APP_URL}/${language.value}/sitemap.xml`,
      changeFrequency: 'weekly' as const,
      lastModified: new Date().toISOString(),
      priority: 1,
    },
    {
      url: `${APP_URL}/${language.value}/movies/sitemap.xml`,
      changeFrequency: 'weekly' as const,
      lastModified: new Date().toISOString(),
      priority: 1,
    },
    {
      url: `${APP_URL}/${language.value}/tv-series/sitemap.xml`,
      changeFrequency: 'weekly' as const,
      lastModified: new Date().toISOString(),
      priority: 1,
    },
  ])

  return [...sitemaps]
}
