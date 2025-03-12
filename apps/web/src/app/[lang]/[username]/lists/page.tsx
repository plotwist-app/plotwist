import { ListCardSkeleton } from '@/components/list-card'
import { Suspense } from 'react'
import { v4 } from 'uuid'
import { UserLists } from '../_components/user-lists'

export default async function ListsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map(_ => (
            <ListCardSkeleton key={v4()} />
          ))}
        </div>
      }
    >
      <UserLists />
    </Suspense>
  )
}
