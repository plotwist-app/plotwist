import { axiosClient } from '..'
import { GetKeywordsResponse } from '../models/keywords'

export const keywords = async (type: 'tv' | 'movie', id: number) => {
  const { data } = await axiosClient.get<GetKeywordsResponse>(
    `/${type}/${id}/keywords`,
  )

  return data.keywords || data.results
}
