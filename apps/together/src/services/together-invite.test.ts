import { describe, expect, it } from 'vitest'
import { buildTogetherInviteUrl } from './together-invite'

describe('buildTogetherInviteUrl', () => {
  it('builds a locale-neutral invite URL', () => {
    expect(
      buildTogetherInviteUrl('https://together.plotwist.app', 'ABC123')
    ).toBe('https://together.plotwist.app/ABC123')
  })

  it('normalizes a trailing slash and lowercase room code', () => {
    expect(
      buildTogetherInviteUrl('https://together.plotwist.app/', 'abc123')
    ).toBe('https://together.plotwist.app/ABC123')
  })
})
