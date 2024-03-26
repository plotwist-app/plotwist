import { axiosClient } from '..'
import { GetGenresResponse } from '../models/genres'
import { Language } from '../models/language'

export const genres = async (type: 'movie' | 'tv', language: Language) => {
  const { data } = await axiosClient.get<GetGenresResponse>(
    `/genre/${type}/list`,
    {
      params: {
        language,
      },
    },
  )

  return data
}
