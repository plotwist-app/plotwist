export type Language =
  | 'en-US'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'ja-JP'

export type PageProps<T> = {
  params: {
    lang: Language
  } & T
}
