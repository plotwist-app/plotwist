import { Suspense } from 'react'
import { UserLists } from '../_components/user-lists'
import { ListCardSkeleton } from '@/components/list-card'
import { v4 } from 'uuid'

export default async function ListsPage(props: {
  params: Promise<{ username: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <ListCardSkeleton key={v4()} />
          ))}
        </div>
      }
    >
      <UserLists />
    </Suspense>
  )
}
