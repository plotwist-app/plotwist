import { api } from '@/services/api'

interface TMDBSearchResult {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  poster_path: string | null
  media_type: 'movie' | 'tv'
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[]
}

export const searchTMDB = async (query: string) => {
  if (!query) return []

  const response = await api.get<TMDBSearchResponse>(
    `/api/tmdb/search?query=${encodeURIComponent(query)}`,
  )

  return response.data.results
}
