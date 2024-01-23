import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import { DetailedCollection } from '../types'

const details = async (id: number, language: Language) => {
  const { data } = await tmdbClient.get<DetailedCollection>(
    `/collection/${id}`,
    {
      params: {
        language,
      },
    },
  )

  return data
}

export const collections = {
  details,
}
