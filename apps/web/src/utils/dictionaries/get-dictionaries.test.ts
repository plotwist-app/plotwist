import { describe, expect, it } from 'vitest'
import { languages } from '../../../languages'
import { getDictionary } from './get-dictionaries'

const REQUIRED_APPEARANCE_KEYS = [
  'appearance',
  'new_interface',
  'experimental',
  'ui_preference_error',
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
