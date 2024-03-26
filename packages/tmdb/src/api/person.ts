import { Language, PersonDetails, PersonWithMediaType, axiosClient } from '..'
import {
  CombinedCredits,
  CombinedCreditsResponse,
} from '../models/combined-credits'
import { formatCombinedCredit } from '../utils/format-combined-credit'
import { ListResponse } from '../utils/list-response'

/*
|-----------------------------------------------------------------------------
| Popular
| 
| References:
| https://developer.themoviedb.org/reference/person-popular-list
|
|-----------------------------------------------------------------------------
*/

type PopularPeopleQueryParams = {
  language: Language
  page: number
}

const popular = async (queryParams: PopularPeopleQueryParams) => {
  const { data } = await axiosClient.get<ListResponse<PersonWithMediaType>>(
    '/person/popular',
    {
      params: {
        ...queryParams,
      },
    },
  )

  return data
}

/*
|-----------------------------------------------------------------------------
| Details
| 
| References:
| https://developer.themoviedb.org/reference/person-details
|
|-----------------------------------------------------------------------------
*/

const details = async (personId: number, language: Language) => {
  const { data } = await axiosClient.get<PersonDetails>(`/person/${personId}`, {
    params: {
      language,
    },
  })

  return data
}

/*
|-----------------------------------------------------------------------------
| Combined credits
| 
| References:
| https://developer.themoviedb.org/reference/person-details
|
|-----------------------------------------------------------------------------
*/

const combinedCredits = async (personId: number, language: Language) => {
  const { data } = await axiosClient.get<CombinedCreditsResponse>(
    `/person/${personId}/combined_credits`,
    {
      params: {
        language,
      },
    },
  )

  const formattedResponse: CombinedCredits = {
    cast: data.cast.map((credit) => formatCombinedCredit(credit)),
    crew: data.cast.map((credit) => formatCombinedCredit(credit)),
  }

  return formattedResponse
}

export const person = { popular, details, combinedCredits }
