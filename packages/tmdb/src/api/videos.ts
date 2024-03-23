import { axiosClient } from '..'
import { GetVideosResponse } from '../models/videos'

type Variant = 'movie' | 'tv'

export const videos = async (variant: Variant, id: number) => {
  const { data } = await axiosClient.get<GetVideosResponse>(`/${variant}/${id}/videos`)

  return data
}
