import { Language } from '@/types/languages'

const dictionaries = {
  'en-US': () =>
    import('../../../public/dictionaries/en-US.json').then((r) => r.default),
  'pt-BR': () =>
    import('../../../public/dictionaries/pt-BR.json').then((r) => r.default),
  'de-DE': () =>
    import('../../../public/dictionaries/de-DE.json').then((r) => r.default),
  'es-ES': () =>
    import('../../../public/dictionaries/es-ES.json').then((r) => r.default),
  'fr-FR': () =>
    import('../../../public/dictionaries/fr-FR.json').then((r) => r.default),
  'it-IT': () =>
    import('../../../public/dictionaries/it-IT.json').then((r) => r.default),
  'ja-JP': () =>
    import('../../../public/dictionaries/ja-JP.json').then((r) => r.default),
} as const

export const getDictionary = (lang: Language) => {
  const langFn = dictionaries[lang]

  return langFn ? langFn() : dictionaries['en-US']()
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
