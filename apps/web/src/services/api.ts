import { ListRecommendations } from '@/types/api/list-recommendations'
import { Language } from '@/types/languages'
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

export const listRecommendations = async (id: string, language: Language) => {
  const { data } = await api.get<ListRecommendations>(
    `/list-recommendations/${id}`,
    {
      params: { language },
    },
  )

  return data
}
