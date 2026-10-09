import { describe, expect, it } from 'vitest'
import { LANGUAGES } from '@/types/languages'
import { getDictionary } from '.'

const REQUIRED_TOGETHER_KEYS = [
  'provider_heading',
  'provider_explanation',
  'provider_region',
  'provider_any',
  'provider_loading',
  'provider_error',
  'provider_retry',
  'provider_continue',
  'provider_selected',
  'create_heading',
  'group_kicker',
  'choosing_with',
  'match_heading',
  'match_interest_summary',
  'continue_discovering',
  'view_matches',
  'match_close',
  'plotwist_cta_title',
  'plotwist_cta_body',
  'plotwist_cta_button',
  'plotwist_cta_dismiss',
  'participant_count',
  'room_full_title',
  'room_full_body',
  'subtitle',
  'waiting_title',
  'waiting_body',
  'ready_title',
  'matches_title',
] as const

const DEPRECATED_TOGETHER_KEYS = [
  'guest_prompt_title',
  'guest_prompt_body',
  'guest_prompt_sign_in',
  'continue_as_guest',
  'night_for_two',
  'tonight_with',
  'up_to_four',
  'room_capacity',
] as const

const PRIVATE_CAPACITY_COPY_KEYS = [
  'participant_count',
  'room_full_title',
  'room_full_body',
] as const

const PUBLIC_CAPACITY_PATTERNS = [
  /\{max\}/i,
  /(^|\D)20(\D|$)/,
  /\{current\}\s*\/|\/\s*\{(?:current|max)\}/i,
  /\b(?:four|quatre|cuatro|quattro|vier|quatro)\b|4\s*(?:人|people|persons|personen|personas|pessoas|persone)?/i,
] as const

describe('dictionary locales', () => {
  it('covers all seven supported locales', () => {
    expect(LANGUAGES).toHaveLength(7)
  })
})

describe('Together dictionary contract', () => {
  it.each(
    LANGUAGES
  )('%s provides every native Together label', async language => {
    const dictionary = await getDictionary(language)
    const together = dictionary.together as Record<string, string>

    for (const key of REQUIRED_TOGETHER_KEYS) {
      const value = together[key]
      expect(typeof value, `${language}.together.${key}`).toBe('string')
      expect(value.trim(), `${language}.together.${key}`).not.toBe('')
    }

    for (const key of DEPRECATED_TOGETHER_KEYS) {
      expect(together[key], `${language}.together.${key}`).toBeUndefined()
    }

    expect(
      together.choosing_with,
      `${language}.together.choosing_with`
    ).toContain('{count}')
    expect(
      together.participant_count,
      `${language}.together.participant_count`
    ).toContain('{current}')
    expect(
      together.participant_count,
      `${language}.together.participant_count`
    ).toMatch(/[:：]\s*\{current\}$/)

    for (const key of PRIVATE_CAPACITY_COPY_KEYS) {
      for (const pattern of PUBLIC_CAPACITY_PATTERNS) {
        expect(together[key], `${language}.together.${key}`).not.toMatch(
          pattern
        )
      }
    }
  })
})
