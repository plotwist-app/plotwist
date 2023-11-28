export type Language = 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-BR'

export type SupportedLanguages = {
  label: string
  value: Language
  country: string
}

export const SUPPORTED_LANGUAGES: Array<SupportedLanguages> = [
  { label: 'English', value: 'en-US', country: 'US' },
  { label: 'Español', value: 'es-ES', country: 'ES' },
  { label: 'Français', value: 'fr-FR', country: 'FR' },
  { label: 'Deutsch', value: 'de-DE', country: 'DE' },
  { label: 'Italiano', value: 'it-IT', country: 'IT' },
  { label: 'Português', value: 'pt-BR', country: 'BR' },
]

export const locales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR']
