import { faker } from '@faker-js/faker'
import type {
  InsertSocialLink,
  SocialLink,
} from '@/domain/entities/social-link'
import { insertSocialLink } from '@/infra/db/repositories/social-links-repository'

type Overrides = Partial<SocialLink> & Pick<SocialLink, 'userId'>

export function makeRawSocialLink(overrides: Overrides): InsertSocialLink {
  return {
    platform: 'INSTAGRAM',
    url: faker.internet.url(),
    ...overrides,
  }
}

export async function makeSocialLink(overrides: Overrides) {
  const [socialLink] = await insertSocialLink(makeRawSocialLink(overrides))

  return socialLink
}
