import { axiosClient } from '../../..'
import {
  PopularPeopleResponse,
  PopularPeopleQueryParams,
} from './popular.types'

export const popular = async (queryParams: PopularPeopleQueryParams) => {
  const { data } = await axiosClient.get<PopularPeopleResponse>(
    '/person/popular',
    {
      params: {
        ...queryParams,
      },
    },
  )

  return data
}
