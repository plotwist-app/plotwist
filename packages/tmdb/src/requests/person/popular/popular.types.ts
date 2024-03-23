import { Language } from '../../..'
import { ListResponse } from '../../../utils/list-response'

export type KnownFor = {
  adult: boolean
  backdrop_path: string
  id: number
  title?: string
  original_language: string
  original_title?: string
  overview: string
  poster_path: string
  media_type: string
  genre_ids: number[]
  popularity: number
  release_date?: string
  video?: boolean
  vote_average: number
  vote_count: number
  name?: string
  original_name?: string
  first_air_date?: string
  origin_country?: string[]
}

export type Person = {
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
  known_for: KnownFor[]
}

export type PopularPeopleResponse = ListResponse<Person>

export type PopularPeopleQueryParams = {
  language: Language
  page: number
}
