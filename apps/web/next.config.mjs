import createMDX from '@next/mdx'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'image.tmdb.org',
      },
    ],
  },
  pageExtensions: ['mdx', 'ts', 'tsx'],
  transpilePackages: ['@plotwist/ui'],
}

export default withMDX(nextConfig)
