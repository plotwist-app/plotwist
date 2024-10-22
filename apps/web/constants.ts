export const APP_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL
    : 'http://localhost:3000'
