import { Language } from '@/types/languages'
import { intlFormatDistance } from 'date-fns'

type TimeFromNowParams = {
  date: Date
  language: Language
}

export function timeFromNow({ date, language: locale }: TimeFromNowParams) {
  return intlFormatDistance(date, new Date(), { locale })
}
