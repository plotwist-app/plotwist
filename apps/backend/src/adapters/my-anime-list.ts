import axios from 'axios'
import type { AnimeDetails } from '@/@types/my-anime-list-request'
import { config } from '@/config'

const BASE_URL = 'https://api.myanimelist.net/v2'

export async function searchAnime(query: string) {
  try {
    const response = await axios.get(`${BASE_URL}/anime`, {
      params: { q: query, limit: 5 },
      headers: { 'X-MAL-Client-ID': config.myAnimeList.MAL_CLIENT_ID },
    })
    return response.data
  } catch (error) {
    throw new Error(
      `Failed to fetch informations, error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export async function searchAnimeById(animedbId: string) {
  try {
    const response = await axios.get(`${BASE_URL}/anime/${animedbId}`, {
      params: {
        fields:
          'id,title,main_picture,synopsis,mean,rank,popularity,genres,start_date,end_date,num_episodes,rating,status',
      },
      headers: {
        'X-MAL-Client-ID': config.myAnimeList.MAL_CLIENT_ID,
      },
    })
    return response.data as AnimeDetails
  } catch (error) {
    throw new Error(
      `Failed to fetch informations, error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
