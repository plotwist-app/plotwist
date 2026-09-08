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
      request('/together/ABC123?source=whatsapp&guest=1', 'pt-BR,pt;q=0.9')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://plotwist.app/pt-BR/together/ABC123?source=whatsapp&guest=1'
    )
  })

  it('passes an already-localized path through unchanged', () => {
    const response = proxy(
      request('/fr-FR/together/ABC123?source=whatsapp', 'pt-BR,pt;q=0.9')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
