import { tmdbClient } from '../..'

type KeywordsOptions = {
  type: 'tv' | 'movie'
  id: number
}

type Keyword = {
  name: string
  id: number
}

type KeywordsResponse = {
  id: number
  results?: Array<Keyword>
  keywords?: Array<Keyword>
}

export const keywords = async ({ id, type }: KeywordsOptions) => {
  const { data } = await tmdbClient.get<KeywordsResponse>(
    `/${type}/${id}/keywords`,
  )

  return data.keywords || data.results
}
