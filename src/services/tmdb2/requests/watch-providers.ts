import { tmdbClient } from '..'
import { WatchProviders } from '../types/watch-providers'

type Type = 'movie' | 'tv'

export const watchProviders = async (type: Type, id: number) => {
  const { data } = await tmdbClient.get<WatchProviders>(
    `/${type}/${id}/watch/providers`,
  )

  return data
}
