import { getSharedUrlByUrl } from '@/infra/db/repositories/shared-urls-repository'

export async function getSharedUrl(url: string) {
  const [sharedUrl] = await getSharedUrlByUrl(url)
  if (!sharedUrl) {
    return null
  }
  return url
}
