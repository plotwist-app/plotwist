import axios from 'axios'

import {
  search,
  movieProviders,
  itemWatchProviders,
  availableRegions,
  tvProviders,
  credits,
  movies,
  tvSeries,
  tvSeasons,
  collections,
  images,
  videos,
  person,
  genres,
  languages,
  keywords,
} from './requests'
import { env } from '@/env.mjs'

const TMDB_API_KEY = env.NEXT_PUBLIC_TMDB_API_KEY

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
  search,
  credits,
  collections,
  videos,
  person,
  genres,
  languages,
  watchProviders: {
    movieProviders,
    itemWatchProviders,
    availableRegions,
    tvProviders,
  },
  keywords,
}
