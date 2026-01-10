export type MyAnimeListImport = {
  '?xml': xmtMetadata
  myanimelist: {
    userInfo: UserInfo
    anime: MALAnimes[]
  }
}

type UserInfo = {
  user_name: string
  user_export_type: number
  user_total_anime: number
  user_total_watching: number
  user_total_completed: number
  user_total_onhold: number
  user_total_dropped: number
  user_total_plantowatch: number
}

export enum MALStatus {
  COMPLETED = 'Completed',
  WATCHING = 'Watching',
  ON_HOLD = 'On-Hold',
  DROPPED = 'Dropped',
  PLAN_TO_WATCH = 'Plan to Watch',
}

export enum SeriesType {
  MOVIE = 'Movie',
  SERIES = 'TV',
}

export type MALAnimes = {
  series_animedb_id: number
  series_title: string
  series_type: SeriesType
  series_episodes: number
  my_id: number
  my_watched_episodes: number
  my_start_date: string
  my_finish_date: string
  my_rated: string
  my_score: number
  my_storage: string
  my_storage_value: number
  my_status: MALStatus
  my_comments: string
  my_times_watched: number
  my_rewatch_value: string
  my_priority: string
  my_tags: string
  my_rewatching: number
  my_rewatching_ep: number
  my_discuss: number
  my_sns: string
  update_on_import: number
}

type xmtMetadata = { '@_version': string; '@_encoding': string }
