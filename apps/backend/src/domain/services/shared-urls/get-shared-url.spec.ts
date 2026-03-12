import { describe, expect, it } from 'vitest'
import { makeSharedUrl } from '@/test/factories/make-shared-url'
import { getSharedUrl } from './get-shared-url'

describe('getSharedUrl', () => {
  it('should return null for a non-existent short code', async () => {
    const result = await getSharedUrl('nonexistent')
    expect(result).toBeNull()
  })

  it('should return the shared url for an existing short code', async () => {
    const { shortCode, longUrl, userId } = await makeSharedUrl()

    const result = await getSharedUrl(shortCode)
    expect(result).not.toBeNull()
    expect(result?.url).toBe(shortCode)
    expect(result?.originalUrl).toBe(longUrl)
    expect(result?.userId).toBe(userId)
  })
})
