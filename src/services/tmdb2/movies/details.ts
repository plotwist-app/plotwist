import { Locale } from '@/types/locales'
import { tmdbClient } from '..'

export const details = async (id: number, language: Locale = 'en-US') => {
  try {
    const { data } = await tmdbClient.get(`/movie/${id}`, {
      params: {
        language,
      },
    })

    return data
  } catch (e) {
    console.log(e)
  }
}
