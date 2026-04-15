import { describe, expect, it } from 'vitest'
import { base62Encode } from './base62'

describe('base62Encode', () => {
  it('should encode 0 as "0"', () => {
    expect(base62Encode(0)).toBe('0')
  })

  it('should encode small numbers correctly', () => {
    expect(base62Encode(1)).toBe('1')
    expect(base62Encode(9)).toBe('9')
    expect(base62Encode(10)).toBe('a')
    expect(base62Encode(35)).toBe('z')
    expect(base62Encode(36)).toBe('A')
    expect(base62Encode(61)).toBe('Z')
    expect(base62Encode(62)).toBe('10')
  })

  it('should encode larger numbers', () => {
    expect(base62Encode(3844)).toBe('100')
    expect(base62Encode(238327)).toBe('ZZZ')
  })

  it('should apply salt by adding it to id before encoding', () => {
    const withoutSalt = base62Encode(100, 0)
    const withSalt = base62Encode(100, 1000)

    expect(withoutSalt).not.toBe(withSalt)
    expect(withSalt).toBe(base62Encode(1100))
  })

  it('should clamp negative results to 0', () => {
    expect(base62Encode(-5)).toBe('0')
    expect(base62Encode(0, -10)).toBe('0')
  })

  it('should produce unique codes for sequential ids', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      codes.add(base62Encode(i))
    }
    expect(codes.size).toBe(1000)
  })

  it('should produce the expected code at the 14_000_000 counter start', () => {
    const code = base62Encode(14_000_000)
    expect(code).toBeTruthy()
    expect(code.length).toBeGreaterThanOrEqual(4)
    expect(code).toMatch(/^[0-9a-zA-Z]+$/)
  })
})
