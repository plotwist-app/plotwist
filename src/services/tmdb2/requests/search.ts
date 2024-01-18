import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import {
  ListResponse,
  MovieWithMediaType,
  TvShowWithMediaType,
  PersonWithMediaType,
} from '../types'

type MultiResponse = ListResponse<
  MovieWithMediaType | TvShowWithMediaType | PersonWithMediaType
>

const multi = async (query: string, language: Language) => {
  const { data } = await tmdbClient.get<MultiResponse>('/search/multi', {
    params: {
      query,
      language,
    },
  })

  return data
}

export const search = { multi }
