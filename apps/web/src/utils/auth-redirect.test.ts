import { describe, expect, it } from 'vitest'
import { getSafeLocalizedRedirectPath } from './auth-redirect'

describe('getSafeLocalizedRedirectPath', () => {
  it('accepts an internal path within the current locale', () => {
    expect(
      getSafeLocalizedRedirectPath('/pt-BR/together?code=ABC123', 'pt-BR')
    ).toBe('/pt-BR/together?code=ABC123')
  })

  it.each([
    'https://evil.example/pt-BR/together',
    '//evil.example/pt-BR/together',
    String.raw`\evil.example\pt-BR\together`,
    String.raw`/pt-BR\@evil.example/together`,
    '/pt-BR/%5C%5Cevil.example',
    '/pt-BR/%255C%255Cevil.example',
    '/%2F%2Fevil.example/pt-BR/together',
    '/%252F%252Fevil.example/pt-BR/together',
    '/en-US/together',
    '/pt-BR/../en-US/together',
    '/pt-BR/%2E%2E/en-US/together',
  ])('rejects unsafe or locale-crossing target %s', target => {
    expect(getSafeLocalizedRedirectPath(target, 'pt-BR')).toBeNull()
  })

  it('rejects repeated query values', () => {
    expect(
      getSafeLocalizedRedirectPath(
        ['/pt-BR/together', '//evil.example'],
        'pt-BR'
      )
    ).toBeNull()
  })
})
