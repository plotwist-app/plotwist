import createMDX from '@next/mdx'
import { withSentryConfig } from '@sentry/nextjs'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'image.tmdb.org',
      },
    ],
    unoptimized: true,
  },
  pageExtensions: ['mdx', 'ts', 'tsx'],
  transpilePackages: ['@plotwist/ui']
  
}

export default withSentryConfig(withMDX(nextConfig), {
  org: 'plotwist',
  project: 'javascript-nextjs',
  sentryUrl: 'https://sentry.io/',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
