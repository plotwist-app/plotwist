import { UserItems } from '../_components/user-items'
import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'

export default async function WatchingPage() {
  const filters: CollectionFiltersFormValues = {
    status: 'WATCHING',
    userId: '',
    rating: [0, 5],
    mediaType: ['TV_SHOW', 'MOVIE'],
    orderBy: 'addedAt.desc',
    onlyItemsWithoutReview: false,
  }

  return <UserItems filters={filters} />
}
