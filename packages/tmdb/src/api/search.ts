
import { axiosClient } from '..'

import { Language } from '../models/language'

import {
  ListResponse,
  MovieWithMediaType,
  TvSerieWithMediaType,
  PersonWithMediaType,
} from '../types'

type MultiResponse = ListResponse<
  MovieWithMediaType | TvSerieWithMediaType | PersonWithMediaType
>

const multi = async (query: string, language: Language) => {
  const { data } = await axiosClient.get<MultiResponse>('/search/multi', {
    params: {
      query,
      language,
    },
  })

  return data
}

export const search = { multi }
