import { axiosClient } from ".."
import { Language } from "../models/language"
import { SeasonDetails } from "../models/season"

const details = async (
  seriesId: number,
  seasonNumber: number,
  language: Language,
) => {
  const { data } = await axiosClient.get<SeasonDetails>(
    `/tv/${seriesId}/season/${seasonNumber}`,
    {
      params: {
        language,
      },
    },
  )

  return data
}

export const season = { details }