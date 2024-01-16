import { Locale } from '@/types/locales'

export type SupportLocales = {
  label: string
  value: Locale
  country: string
  enabled: boolean
}

export const SUPPORTED_LOCALES: Array<SupportLocales> = [
  { label: 'English', value: 'en-US', country: 'US', enabled: true },
  { label: 'Español', value: 'es-ES', country: 'ES', enabled: false },
  { label: 'Français', value: 'fr-FR', country: 'FR', enabled: false },
  { label: 'Deutsch', value: 'de-DE', country: 'DE', enabled: false },
  { label: 'Italiano', value: 'it-IT', country: 'IT', enabled: false },
  { label: 'Português', value: 'pt-BR', country: 'BR', enabled: true },
  { label: '日本語', value: 'ja-JP', country: 'JP', enabled: false },
]

export const locales: Locale[] = [
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'ja-JP',
]
