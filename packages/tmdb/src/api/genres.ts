import { axiosClient } from ".."
import { Language } from "../models/language"

export const genres = async (type: 'movie' | 'tv', language: Language) => {
  const { data } = await axiosClient.get(`/genre/${type}/list`, {
    params: {
      language,
    },
  })

  return data
}
