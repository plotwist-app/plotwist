import { selectSocialLinks } from '@/infra/db/repositories/social-links-repository'

type Input = {
  userId: string
}

export async function getSocialLinksService({ userId }: Input) {
  const socialLinks = await selectSocialLinks(userId)

  return { socialLinks }
}
