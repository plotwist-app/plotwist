import { Language } from '@/types/languages'

export type SupportedLanguages = {
  label: string
  value: Language
  country: string
  enabled: boolean
  hreflang: string
}

export const SUPPORTED_LANGUAGES: Array<SupportedLanguages> = [
  {
    label: 'English',
    value: 'en-US',
    country: 'US',
    enabled: true,
    hreflang: 'en',
  },
  {
    label: 'Español',
    value: 'es-ES',
    country: 'ES',
    enabled: true,
    hreflang: 'es',
  },
  {
    label: 'Français',
    value: 'fr-FR',
    country: 'FR',
    enabled: true,
    hreflang: 'fr',
  },
  {
    label: 'Deutsch',
    value: 'de-DE',
    country: 'DE',
    enabled: true,
    hreflang: 'de',
  },
  {
    label: 'Italiano',
    value: 'it-IT',
    country: 'IT',
    enabled: true,
    hreflang: 'it',
  },
  {
    label: 'Português',
    value: 'pt-BR',
    country: 'BR',
    enabled: true,
    hreflang: 'pt',
  },
  {
    label: '日本語',
    value: 'ja-JP',
    country: 'JP',
    enabled: true,
    hreflang: 'ja',
  },
]

export const languages: Language[] = [
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'ja-JP',
]
