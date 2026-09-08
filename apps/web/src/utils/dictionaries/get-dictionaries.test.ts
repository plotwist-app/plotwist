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
  'match_heading',
  'match_interest_summary',
  'continue_discovering',
  'view_matches',
  'guest_prompt_title',
  'guest_prompt_body',
  'guest_prompt_sign_in',
  'continue_as_guest',
  'up_to_four',
  'room_capacity',
  'room_full_title',
  'room_full_body',
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

    for (const key of REQUIRED_TOGETHER_KEYS) {
      const value = dictionary.together[key]
      expect(typeof value, `${language}.together.${key}`).toBe('string')
      expect(value.trim(), `${language}.together.${key}`).not.toBe('')
    }
  })
})
