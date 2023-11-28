import { TMDB as TMDBts } from 'tmdb-ts'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? ''
export const TMDB = new TMDBts(TMDB_API_KEY)
