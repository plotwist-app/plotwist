import { selectSocialLinks } from '@/db/repositories/social-links-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

type Input = {
  userId: string
}

const getSocialLinksServiceImpl = async ({ userId }: Input) => {
  const socialLinks = await selectSocialLinks(userId)

  return { socialLinks }
}

export const getSocialLinksService = withServiceTracing(
  'get-social-links',
  getSocialLinksServiceImpl
)
