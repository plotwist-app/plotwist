import {
  deleteSocialLink,
  insertSocialLink,
} from '@/db/repositories/social-links-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { InsertSocialLink } from '@/domain/entities/social-link'
import type { socialLinksBodySchema } from '@/http/schemas/social-links'

type Input = {
  values: typeof socialLinksBodySchema._type
  userId: string
}

const upsertSocialLinksServiceImpl = async ({ userId, values }: Input) => {
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

export const upsertSocialLinksService = withServiceTracing(
  'upsert-social-links',
  upsertSocialLinksServiceImpl
)
