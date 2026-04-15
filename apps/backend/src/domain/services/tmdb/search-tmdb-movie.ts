import { tmdb } from '@/infra/adapters/tmdb'

export async function searchTMDBMovie(name: string) {
  const result = await tmdb.search.multi(name, 'en-US')

  return result
}
