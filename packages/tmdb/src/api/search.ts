import { axiosClient } from '..'

import { Language } from '../models/language'
import { MovieWithMediaType } from '../models/movie'
import { TvSerieWithMediaType } from '../models/tv-series'
import { PersonWithMediaType } from '../models/person'

import { ListResponse } from '../utils/list-response'

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
