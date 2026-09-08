import { describe, expect, it } from 'vitest'
import { buildTogetherInviteUrl } from './together-invite'

describe('buildTogetherInviteUrl', () => {
  it('builds a locale-neutral invite URL', () => {
    expect(buildTogetherInviteUrl('https://plotwist.app', 'ABC123')).toBe(
      'https://plotwist.app/together/ABC123'
    )
  })

  it('normalizes a trailing slash and lowercase room code', () => {
    expect(buildTogetherInviteUrl('https://plotwist.app/', 'abc123')).toBe(
      'https://plotwist.app/together/ABC123'
    )
  })
})
