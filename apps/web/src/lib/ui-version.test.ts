import { describe, expect, it } from 'vitest'
import {
  parseUiVersion,
  readUiVersionCookie,
  serializeUiVersionCookie,
} from './ui-version'

describe('ui version preference', () => {
  it.each([
    [undefined, 'classic'],
    [null, 'classic'],
    ['', 'classic'],
    ['unexpected', 'classic'],
    ['classic', 'classic'],
    ['cinematic', 'cinematic'],
  ] as const)('parses %s as %s', (value, expected) => {
    expect(parseUiVersion(value)).toBe(expected)
  })

  it('reads the preference from a cookie header', () => {
    expect(readUiVersionCookie('theme=dark; plotwist-ui=cinematic')).toBe(
      'cinematic'
    )
  })

  it('rejects a preference with trailing cookie value data', () => {
    expect(readUiVersionCookie('plotwist-ui=cinematic=invalid')).toBe('classic')
  })

  it('serializes a persistent first-party cookie', () => {
    expect(serializeUiVersionCookie('cinematic')).toBe(
      'plotwist-ui=cinematic; Path=/; Max-Age=31536000; SameSite=Lax'
    )
  })
})
