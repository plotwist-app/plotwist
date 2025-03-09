import type { UserItemStatus } from '@/types/user-item'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { Suspense } from 'react'
import { v4 } from 'uuid'
import { UserItemsList } from './user-items-list'

export type UserItemsProps = { status: UserItemStatus }

export function UserItems({ status }: UserItemsProps) {
  return (
    <section className="grid grid-cols-3 md:grid-cols-5 gap-2">
      <Suspense
        fallback={Array.from({ length: 20 }).map(_ => (
          <Skeleton key={v4()} className="aspect-poster" />
        ))}
      >
        <UserItemsList status={status} />
      </Suspense>
    </section>
  )
}
