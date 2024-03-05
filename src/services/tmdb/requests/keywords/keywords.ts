import { Language } from '@/types/languages'
import { tmdbClient } from '../..'

type KeywordsOptions = {
  type: 'tv' | 'movie'
  id: number
  language: Language
}

type KeywordsResponse = {
  id: number
  results: Array<{
    name: string
    id: number
  }>
}

export const keywords = async ({ id, language, type }: KeywordsOptions) => {
  const {
    data: { results },
  } = await tmdbClient.get<KeywordsResponse>(`/${type}/${id}/keywords`, {
    params: {
      language,
    },
  })

  return results
}
