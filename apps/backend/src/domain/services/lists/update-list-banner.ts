import { ListNotFoundError } from '@/domain/errors/list-not-found-error'
import { updateListBanner } from '@/infra/db/repositories/list-repository'

export type UpdateListBannerInput = {
  listId: string
  bannerUrl?: string
  userId: string
}

export async function updateListBannerService(input: UpdateListBannerInput) {
  const [list] = await updateListBanner(input)

  if (!list) {
    return new ListNotFoundError()
  }

  return { list }
}
