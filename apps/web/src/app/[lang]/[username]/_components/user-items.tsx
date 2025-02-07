import { UserItemsList } from './user-items-list'
import { Suspense } from 'react'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { v4 } from 'uuid'
import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'

export type UserItemsProps = {
  filters: CollectionFiltersFormValues
}

export function UserItems({ filters }: UserItemsProps) {
  return (
    <section className="grid grid-cols-3 md:grid-cols-5 gap-2">
      <Suspense
        fallback={Array.from({ length: 20 }).map(_ => (
          <Skeleton key={v4()} className="aspect-poster" />
        ))}
      >
        <UserItemsList filters={filters} />
      </Suspense>
    </section>
  )
}
