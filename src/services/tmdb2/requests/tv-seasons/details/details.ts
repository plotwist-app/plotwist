import { tmdbClient } from '@/services/tmdb2'
import { Language } from '@/types/languages'
import { SeasonDetails } from '.'

export const details = async (
  seriesId: number,
  seasonNumber: number,
  language: Language,
) => {
  const { data } = await tmdbClient.get<SeasonDetails>(
    `/tv/${seriesId}/season/${seasonNumber}`,
    {
      params: {
        language,
      },
    },
  )

  return data
}
