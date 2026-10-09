import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { proxy } from './proxy'

function request(path: string, acceptLanguage = 'en-US') {
  return new NextRequest(`https://plotwist.app${path}`, {
    headers: {
      'accept-language': acceptLanguage,
      'user-agent': 'Mozilla/5.0',
    },
  })
}

describe('proxy locale integration', () => {
  it('redirects a locale-less path while preserving its path and query', () => {
    const response = proxy(
      request('/movies/popular?page=2&sort=rating', 'pt-BR,pt;q=0.9')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://plotwist.app/pt-BR/movies/popular?page=2&sort=rating'
    )
  })

  it('passes an already-localized path through unchanged', () => {
    const response = proxy(
      request('/fr-FR/movies/popular?page=2', 'pt-BR,pt;q=0.9')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})

describe('proxy legacy Together redirects', () => {
  it.each([
    ['/pt-BR/together', 'https://together.plotwist.app/pt-BR'],
    ['/pt-BR/together/', 'https://together.plotwist.app/pt-BR'],
    ['/pt-BR/together/ABC123', 'https://together.plotwist.app/pt-BR/ABC123'],
    [
      '/ja-JP/together/ABC123/vote',
      'https://together.plotwist.app/ja-JP/ABC123/vote',
    ],
    [
      '/en-US/together/ABC123/matches?source=whatsapp',
      'https://together.plotwist.app/en-US/ABC123/matches?source=whatsapp',
    ],
  ])('permanently redirects the localized path %s', (path, location) => {
    const response = proxy(request(path, 'de-DE'))

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(location)
  })

  it.each([
    ['/together', 'https://together.plotwist.app/'],
    ['/together/ABC123', 'https://together.plotwist.app/ABC123'],
    [
      '/together/ABC123?source=whatsapp&guest=1',
      'https://together.plotwist.app/ABC123?source=whatsapp&guest=1',
    ],
  ])('leaves locale detection to the new app for %s', (path, location) => {
    const response = proxy(request(path, 'pt-BR,pt;q=0.9'))

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(location)
  })

  it.each([
    '/togetherness',
    '/pt-BR/together-later',
  ])('does not treat %s as a Together URL', path => {
    const response = proxy(request(path, 'pt-BR,pt;q=0.9'))

    expect(response.status).not.toBe(308)
    expect(response.headers.get('location') ?? '').not.toContain(
      'together.plotwist.app'
    )
  })
})
