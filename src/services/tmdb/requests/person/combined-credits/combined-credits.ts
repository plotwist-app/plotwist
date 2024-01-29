import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import {
  CombinedCredits,
  CombinedCreditsResponse,
  Credit,
  RawCredit,
  RawMovieCredit,
  RawMovieTvShowCredit,
} from './combined-credits.types'

const formatCredit = (credit: RawCredit): Credit => {
  if ((credit as RawMovieTvShowCredit).name) {
    const {
      first_air_date: date,
      id,
      name,
      character,
      vote_average: rating,
    } = credit as RawMovieTvShowCredit

    return {
      date,
      id,
      rating,
      title: name,
      media_type: 'tv',
      role: character,
    }
  }

  const {
    title,
    id,
    character,
    release_date: date,
    vote_average: rating,
  } = credit as RawMovieCredit

  return {
    title,
    id,
    date,
    rating,
    media_type: 'movie',
    role: character,
  }
}

export const combinedCredits = async (personId: number, language: Language) => {
  const { data } = await tmdbClient.get<CombinedCreditsResponse>(
    `/person/${personId}/combined_credits`,
    {
      params: {
        language,
      },
    },
  )

  const formattedResponse: CombinedCredits = {
    cast: data.cast.map((credit) => formatCredit(credit)),
    crew: data.cast.map((credit) => formatCredit(credit)),
  }

  return formattedResponse
}
