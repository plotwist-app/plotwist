export type Language = 'en-US' | 'pt-BR'

export type GetLanguagesResponse = Array<{
  english_name: string
  iso_639_1: string
  name: string
}>
