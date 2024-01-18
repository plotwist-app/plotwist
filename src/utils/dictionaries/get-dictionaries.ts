import { Language } from '@/types/languages'
import { Dictionary } from './get-dictionaries.types'

const dictionaries: Record<Language, () => Promise<Dictionary>> = {
  'en-US': () =>
    import('../../../dictionaries/en-US.json').then((r) => r.default),
  'pt-BR': () =>
    import('../../../dictionaries/pt-BR.json').then((r) => r.default),
  'de-DE': () =>
    import('../../../dictionaries/de-DE.json').then((r) => r.default),
  'es-ES': () =>
    import('../../../dictionaries/es-ES.json').then((r) => r.default),
  'fr-FR': () =>
    import('../../../dictionaries/fr-FR.json').then((r) => r.default),
  'it-IT': () =>
    import('../../../dictionaries/it-IT.json').then((r) => r.default),
  'ja-JP': () =>
    import('../../../dictionaries/ja-JP.json').then((r) => r.default),
}

export const getDictionary = (lang: Language) => {
  return dictionaries[lang]()
}
