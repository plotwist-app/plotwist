import { Language } from '@/types/languages'

export const formatCurrency = (
  amount: number,
  language: Language = 'en-US',
) => {
  const commonOptions = {
    style: 'currency',
    minimumFractionDigits: 0,
  }

  const amountByLanguage: Record<Language, string> = {
    'en-US': amount.toLocaleString('en-US', {
      ...commonOptions,
      currency: 'USD',
    }),
    'es-ES': amount.toLocaleString('es-ES', {
      ...commonOptions,
      currency: 'EUR',
    }),
    'fr-FR': amount.toLocaleString('fr-FR', {
      ...commonOptions,
      currency: 'EUR',
    }),
    'de-DE': amount.toLocaleString('de-DE', {
      ...commonOptions,
      currency: 'EUR',
    }),
    'it-IT': amount.toLocaleString('it-IT', {
      ...commonOptions,
      currency: 'EUR',
    }),
    'pt-BR': amount.toLocaleString('pt-BR', {
      ...commonOptions,
      currency: 'BRL',
    }),
    'ja-JP': amount.toLocaleString('ja-JP', {
      ...commonOptions,
      currency: 'JPY',
    }),
  }

  return amountByLanguage[language]
}
