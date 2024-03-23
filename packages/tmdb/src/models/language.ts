export type Language =
  | 'en-US'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'ja-JP'

export type GetLanguagesResponse = Array<{
  english_name: string
  iso_639_1: string
  name: string
}>
