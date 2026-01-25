import { intlFormatDistance } from 'date-fns'
import type { Language } from '@/types/languages'

type TimeFromNowParams = {
  date: Date
  language: Language
}

export function timeFromNow({ date, language: locale }: TimeFromNowParams) {
  return intlFormatDistance(date, new Date(), { locale })
}
