import type { Language } from '@plotwist_app/tmdb'

const languageByWatchRegion: Record<string, Language> = {
  BR: 'pt-BR',
  US: 'en-US',
  FR: 'fr-FR',
  DE: 'de-DE',
  ES: 'es-ES',
  IT: 'it-IT',
  JP: 'ja-JP',
}

const DEFAULT_LANGUAGE = 'en-US' as const

export function getLanguageByWatchRegion(watchRegion?: string | null) {
  if (!watchRegion) return DEFAULT_LANGUAGE

  return languageByWatchRegion[watchRegion] || DEFAULT_LANGUAGE
}
