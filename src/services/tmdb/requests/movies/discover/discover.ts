import { tmdbClient } from '@/services/tmdb'
import { ListResponse, Movie } from '@/services/tmdb/types'

export const discover = async () => {
  const { data } = await tmdbClient.get<ListResponse<Movie>>(`/discover/movie`)

  return data
}
