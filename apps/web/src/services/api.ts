import { ListRecommendations } from '@/types/api/list-recommendations'
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

export const listRecommendations = async (id: string) => {
  const { data } = await api.get<ListRecommendations>(
    `/list-recommendations/${id}`,
  )

  return data
}
