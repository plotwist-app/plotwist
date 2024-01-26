import { tmdbClient } from '@/services/tmdb2'
import { ListResponse, Movie } from '@/services/tmdb2/types'

export const discover = async () => {
  const { data } = await tmdbClient.get<ListResponse<Movie>>(`/discover/movie`)

  return data
}
