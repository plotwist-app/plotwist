import type { Language } from '@/types/languages'
import type { Locale } from 'date-fns'
import { de, enUS, es, fr, it, ja, ptBR } from 'date-fns/locale'

export const locale: Record<Language, Locale> = {
  'de-DE': de,
  'en-US': enUS,
  'es-ES': es,
  'fr-FR': fr,
  'it-IT': it,
  'ja-JP': ja,
  'pt-BR': ptBR,
}
