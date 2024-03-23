import axios from 'axios'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

export const axiosClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
})

