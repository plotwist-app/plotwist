import { tmdbClient } from '../..'

type Language = {
  english_name: string
  iso_639_1: string
  name: string
}

export const languages = async () => {
  const { data } = await tmdbClient.get<Language[]>('/configuration/languages')
  return data
}
