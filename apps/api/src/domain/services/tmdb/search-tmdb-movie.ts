import { tmdb } from '@/adapters/tmdb'

export async function searchTMDBMovie(name: string) {
  const result = await tmdb.search.multi(name, 'en-US')

  return result
}
