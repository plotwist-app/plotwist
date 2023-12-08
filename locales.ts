export type Locale = 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-BR'

export type SupportLocales = {
  label: string
  value: Locale
  country: string
}

export const SUPPORTED_LOCALES: Array<SupportLocales> = [
  { label: 'English', value: 'en-US', country: 'US' },
  { label: 'Español', value: 'es-ES', country: 'ES' },
  { label: 'Français', value: 'fr-FR', country: 'FR' },
  { label: 'Deutsch', value: 'de-DE', country: 'DE' },
  { label: 'Italiano', value: 'it-IT', country: 'IT' },
  { label: 'Português', value: 'pt-BR', country: 'BR' },
]

export const locales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR']
