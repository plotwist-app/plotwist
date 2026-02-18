import { updateListBanner } from '@/db/repositories/list-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { ListNotFoundError } from '@/domain/errors/list-not-found-error'

export type UpdateListBannerInput = {
  listId: string
  bannerUrl?: string
  userId: string
}

const updateListBannerServiceImpl = async (input: UpdateListBannerInput) => {
  const [list] = await updateListBanner(input)

  if (!list) {
    return new ListNotFoundError()
  }

  return { list }
}

export const updateListBannerService = withServiceTracing(
  'update-list-banner',
  updateListBannerServiceImpl
)
