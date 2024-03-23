import { axiosClient } from ".."
import { Language } from "../models/language"
import { MovieDetails } from "../models/movie"

const details = async (id: number, language: Language) => {
  const { data } = await axiosClient.get<MovieDetails>(`/movie/${id}`, {
    params: {
      language,
    },
  })

  return data
}

export const movie = { details }