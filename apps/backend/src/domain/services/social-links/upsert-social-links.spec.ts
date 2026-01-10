import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { makeUser } from '@/test/factories/make-user'
import { getSocialLinksService } from './get-social-links'
import { upsertSocialLinksService } from './upsert-social-links'

let user: User

const instagramURL = faker.internet.url()

describe('upsert social links subscription', () => {
  beforeAll(async () => {
    user = await makeUser()

    await upsertSocialLinksService({
      userId: user.id,
      values: {
        INSTAGRAM: instagramURL,
      },
    })
  })

  it('should be able to create social links', async () => {
    const result = await getSocialLinksService({
      userId: user.id,
    })

    expect(result).toEqual({
      socialLinks: expect.objectContaining([
        expect.objectContaining({ url: instagramURL }),
      ]),
    })
  })

  it('should be able to update social links', async () => {
    const newInstagramURL = faker.internet.url()

    await upsertSocialLinksService({
      userId: user.id,
      values: {
        INSTAGRAM: newInstagramURL,
      },
    })

    const result = await getSocialLinksService({
      userId: user.id,
    })

    expect(result).toEqual({
      socialLinks: expect.objectContaining([
        expect.objectContaining({ url: newInstagramURL }),
      ]),
    })
  })

  it('should be able to delete empty social links', async () => {
    await upsertSocialLinksService({
      userId: user.id,
      values: {
        INSTAGRAM: '',
      },
    })

    const result = await getSocialLinksService({
      userId: user.id,
    })

    const hasInstagramLink = result.socialLinks.some(
      link => link.platform === 'INSTAGRAM'
    )

    expect(hasInstagramLink).toBe(false)
  })
})
