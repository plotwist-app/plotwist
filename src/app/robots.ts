import { MetadataRoute } from 'next'
import { APP_URL } from '../../constants'
import { SUPPORTED_LANGUAGES } from '../../languages'

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: SUPPORTED_LANGUAGES.map(
      (supportedLanguage) =>
        `${APP_URL}/${supportedLanguage.value}/sitemap.xml`,
    ),
    host: APP_URL,
  }
}
