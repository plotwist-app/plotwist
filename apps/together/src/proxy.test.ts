import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { proxy } from './proxy'

function request(path: string, acceptLanguage = 'en-US') {
  return new NextRequest(`https://together.plotwist.app${path}`, {
    headers: {
      'accept-language': acceptLanguage,
      'user-agent': 'Mozilla/5.0',
    },
  })
}

describe('proxy locale handling', () => {
  it('redirects the root to the detected locale', () => {
    const response = proxy(request('/', 'pt-BR,pt;q=0.9'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://together.plotwist.app/pt-BR'
    )
  })

  it('redirects a locale-neutral invite link while preserving its query', () => {
    const response = proxy(
      request('/ABC123?source=whatsapp&guest=1', 'fr;q=0.9,en;q=0.8')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://together.plotwist.app/fr-FR/ABC123?source=whatsapp&guest=1'
    )
  })

  it('falls back to English without an Accept-Language header', () => {
    const response = proxy(
      new NextRequest('https://together.plotwist.app/ABC123/vote')
    )

    expect(response.headers.get('location')).toBe(
      'https://together.plotwist.app/en-US/ABC123/vote'
    )
  })

  it.each([
    '/fr-FR',
    '/fr-FR/ABC123?source=whatsapp',
    '/ja-JP/ABC123/matches',
  ])('passes the already-localized path %s through unchanged', path => {
    const response = proxy(request(path, 'pt-BR,pt;q=0.9'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('does not treat a locale-like room code as a locale prefix', () => {
    const response = proxy(request('/pt-BRX', 'de-DE'))

    expect(response.headers.get('location')).toBe(
      'https://together.plotwist.app/de-DE/pt-BRX'
    )
  })
})
