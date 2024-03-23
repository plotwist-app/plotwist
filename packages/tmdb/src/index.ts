import axios from 'axios'
import {
  collections,
  credits,
  genres,
  images,
  keywords,
  languages,
  movies,
  search,
  season,
  tv,
  videos,
  watchProviders,
} from './api'

// TODO: change directory (requests -> api)
import { person } from './requests/person'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

export const axiosClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
})

export const tmdb = {
  collections,
  credits,
  genres,
  images,
  keywords,
  languages,
  movies,
  search,
  season,
  tv,
  videos,
  watchProviders,
  person,
}
