import axios from 'axios'

import {
  search,
  watchProviders,
  credits,
  movies,
  tvSeries,
  tvSeasons,
  collections,
  images,
  videos,
} from './requests'

const TMDB_API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ?? process.env.VITE_TMDB_API_KEY

export const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
})

export const tmdb = {
  movies,
  tvSeries,
  tvSeasons,
  images,
  watchProviders,
  search,
  credits,
  collections,
  videos,
}
