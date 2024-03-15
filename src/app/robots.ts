import { MetadataRoute } from 'next'
import sitemap from './sitemap'
import { APP_URL } from '../../constants'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const sitemapItems = await sitemap()
  const allow = sitemapItems.map((sitemapItem) => sitemapItem.url)

  console.log({ allow })

  return {
    rules: {
      userAgent: '*',
      allow,
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
