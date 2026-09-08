import { describe, expect, it } from 'vitest'
import { detectRequestLocale } from './request-locale'

describe('detectRequestLocale', () => {
  it('selects an exact supported locale', () => {
    expect(detectRequestLocale('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt-BR')
  })

  it('maps a base language to its supported locale', () => {
    expect(detectRequestLocale('fr;q=0.9,en;q=0.8')).toBe('fr-FR')
  })

  it('honors language quality preferences', () => {
    expect(detectRequestLocale('es;q=0.4,de;q=0.9')).toBe('de-DE')
  })

  it.each(['fr;q=2,de;q=1', 'fr;q=0.9junk,de;q=0.8'])(
    'ignores an entry with an invalid quality value in %s',
    acceptLanguage => {
      expect(detectRequestLocale(acceptLanguage)).toBe('de-DE')
    }
  )

  it('ignores malformed and wildcard language ranges', () => {
    expect(detectRequestLocale('not_a_locale,*;q=0.9,ja;q=0.8')).toBe('ja-JP')
  })

  it('defaults to English when the header is absent', () => {
    expect(detectRequestLocale(null)).toBe('en-US')
  })
})
