import { Locale } from '../../../locales'

export const formatCurrency = (amount: number, locale: Locale = 'en-US') => {
  const commonOptions = {
    style: 'currency',
    minimumFractionDigits: 0,
  }

  const amountByLocale: Record<Locale, string> = {
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
  }

  return amountByLocale[locale]
}
