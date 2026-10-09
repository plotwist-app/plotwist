import { asLanguage } from '@/types/languages'

const dictionaries = {
  'en-US': () => import('./en-US.json').then(r => r.default),
  'pt-BR': () => import('./pt-BR.json').then(r => r.default),
  'de-DE': () => import('./de-DE.json').then(r => r.default),
  'es-ES': () => import('./es-ES.json').then(r => r.default),
  'fr-FR': () => import('./fr-FR.json').then(r => r.default),
  'it-IT': () => import('./it-IT.json').then(r => r.default),
  'ja-JP': () => import('./ja-JP.json').then(r => r.default),
} as const

export const getDictionary = (lang: string) => dictionaries[asLanguage(lang)]()

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
