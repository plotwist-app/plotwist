export type MediaType = 'tv' | 'movie' | 'person'
export type WithMediaType<T, K extends MediaType> = T & {
  media_type: K
}
