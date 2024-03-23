import { env } from '@/env.mjs'

export const APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://plotwist.app'
    : 'http://localhost:3000'

export const TESTING_USER = {
  email: env.TESTING_USER_EMAIL || '',
  password: env.TESTING_USER_PASSWORD || '',
}
