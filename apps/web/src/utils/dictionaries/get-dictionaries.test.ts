import { describe, expect, it } from 'vitest'
import { languages } from '../../../languages'
import { getDictionary } from './get-dictionaries'

const REQUIRED_APPEARANCE_KEYS = [
  'appearance',
  'new_interface',
  'experimental',
  'ui_preference_error',
] as const

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
  'guest_prompt_title',
  'guest_prompt_body',
  'guest_prompt_sign_in',
  'continue_as_guest',
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
  'night_for_two',
  'tonight_with',
  'up_to_four',
  'room_capacity',
] as const

describe('appearance dictionary contract', () => {
  it('covers all seven supported locales', () => {
    expect(languages).toHaveLength(7)
  })

  it.each(languages)('%s provides every appearance label', async language => {
    const dictionary = await getDictionary(language)

    for (const key of REQUIRED_APPEARANCE_KEYS) {
      expect(dictionary[key].trim(), `${language}.${key}`).not.toBe('')
    }
  })
})

describe('Together dictionary contract', () => {
  it.each(
    languages
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
  })
})
