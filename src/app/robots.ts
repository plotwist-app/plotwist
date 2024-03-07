import { MetadataRoute } from 'next'
import { SUPPORTED_LANGUAGES } from '../../languages'
import { APP_ROUTES } from './sitemap'
import { APP_URL } from '../../constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: SUPPORTED_LANGUAGES.map((language) =>
        APP_ROUTES.map((route) => `/${language}${route}`),
      ).flatMap((route) => route),
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
