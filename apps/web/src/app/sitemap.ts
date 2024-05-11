import { MetadataRoute } from 'next'
import { SUPPORTED_LANGUAGES } from '../../languages'
import { APP_URL } from '../../constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemaps = SUPPORTED_LANGUAGES.map((language) => [
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
  ]).flatMap((sitemap) => sitemap)

  return [...sitemaps]
}
