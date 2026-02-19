import {
  deleteSocialLink,
  insertSocialLink,
} from '@/db/repositories/social-links-repository'
import type { InsertSocialLink } from '@/domain/entities/social-link'
import type { socialLinksBodySchema } from '@/infra/http/schemas/social-links'

type Input = {
  values: typeof socialLinksBodySchema._type
  userId: string
}

export async function upsertSocialLinksService({ userId, values }: Input) {
  const updates = Object.entries(values).map(async ([platform, url]) => {
    if (url) {
      const teste = await insertSocialLink({
        platform: platform as InsertSocialLink['platform'],
        url,
        userId,
      })

      return teste
    }

    await deleteSocialLink(userId, platform as InsertSocialLink['platform'])
  })

  await Promise.all(updates)
}
