// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { track } from './analytics'

describe('track on the server', () => {
  it('does nothing without a window', () => {
    expect(typeof window).toBe('undefined')
    expect(() => track('room_joined')).not.toThrow()
  })
})
