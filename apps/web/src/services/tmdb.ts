import { TMDB } from '@plotwist_app/tmdb'

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

export const tmdb = TMDB('', {
  baseURL: `${apiUrl}/tmdb`,
})
export * from '@plotwist_app/tmdb'
