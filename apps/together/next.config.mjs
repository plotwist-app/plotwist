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
  transpilePackages: ['@plotwist/ui'],
}

export default nextConfig
