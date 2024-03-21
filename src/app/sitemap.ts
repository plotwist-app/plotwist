import { MetadataRoute } from 'next'
import { SUPPORTED_LANGUAGES } from '../../languages'
import { APP_URL } from '../../constants'

export default function sitemap(): MetadataRoute.Sitemap {
  return SUPPORTED_LANGUAGES.map((language) => ({
    url: `${APP_URL}/${language.value}/sitemap.xml`,
    changeFrequency: 'weekly',
    lastModified: new Date().toISOString(),
    priority: 1,
  }))
}
