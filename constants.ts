export const APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://tmdb-front-end.vercel.app'
    : 'http://localhost:3000'
