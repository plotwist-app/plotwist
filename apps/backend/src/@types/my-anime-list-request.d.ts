export interface AnimeDetails {
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  synopsis?: string
  mean?: number
  rank?: number
  popularity?: number
  genres?: Array<{ id: number; name: string }>
  start_date?: string
  end_date?: string
  num_episodes?: number
  rating?: string
  status?: string
}
