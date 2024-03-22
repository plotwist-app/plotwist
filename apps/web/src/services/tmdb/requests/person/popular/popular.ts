import { tmdbClient } from '@/services/tmdb'
import {
  PopularPeopleResponse,
  PopularPeopleQueryParams,
} from './popular.types'

export const popular = async (queryParams: PopularPeopleQueryParams) => {
  const { data } = await tmdbClient.get<PopularPeopleResponse>(
    '/person/popular',
    {
      params: {
        ...queryParams,
      },
    },
  )

  return data
}
