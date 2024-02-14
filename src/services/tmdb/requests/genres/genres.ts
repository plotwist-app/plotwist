import { Language } from '@/types/languages'
import { tmdbClient } from '../..'

type Genre = {
  id: number
  name: string
}

type List = 'movie' | 'tv'
type Response = {
  genres: Genre[]
}

export const genres = async (type: List, language: Language) => {
  const { data } = await tmdbClient.get<Response>(`/genre/${type}/list`, {
    params: {
      language,
    },
  })

  return data
}
