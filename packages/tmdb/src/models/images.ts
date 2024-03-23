export type Image = {
  aspect_ratio: number
  file_path: string
  height: number
  iso_639_1: string
  vote_average: number
  vote_count: number
  width: number
}

export type GetImagesResponse = {
  id: number
  backdrops: Image[]
  logos: Image[]
  posters: Image[]
  profiles: Image[]
}
