import { tmdbClient } from '../..'
import { WatchProviders } from '../../types/watch-providers'

type Type = 'movie' | 'tv'

export const itemWatchProviders = async (type: Type, id: number) => {
  const { data } = await tmdbClient.get<WatchProviders>(
    `/${type}/${id}/watch/providers`,
  )

  return data
}

// References:
// 1. https://developer.themoviedb.org/reference/movie-watch-providers
// 2. https://developer.themoviedb.org/reference/tv-series-watch-providers
