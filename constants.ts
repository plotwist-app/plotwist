export const APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://plotwist.app'
    : 'http://localhost:3000'

export const TESTING_USER = {
  email: process.env.TESTING_USER_EMAIL || '',
  password: process.env.TESTING_USER_PASSWORD || '',
}
