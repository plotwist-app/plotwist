import { MetadataRoute } from 'next'
import sitemap from './sitemap'
import { APP_URL } from '../../constants'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const sitemapItems = await sitemap()
  const allow = sitemapItems.map((sitemapItem) =>
    sitemapItem.url.replace(APP_URL, ''),
  )

  return {
    rules: {
      userAgent: '*',
      allow,
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
