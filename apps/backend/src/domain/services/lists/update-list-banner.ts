import { updateListBanner } from '@/db/repositories/list-repository'
import { ListNotFoundError } from '@/domain/errors/list-not-found-error'

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
