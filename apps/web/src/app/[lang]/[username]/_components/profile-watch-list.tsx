'use client'

import { useAuth } from '@/context/auth'
import { useQuery } from '@tanstack/react-query'
import { getWatchList } from '@/services/api/watch-list'
import {
  WatchListItemCardSkeleton,
  WatchListItemCard,
} from './profile-watch-list-item-card'

import { WatchListModalSearch } from './profile-watch-list-modal'

type WatchListProps = {
  userId: string
}

export const WatchList = ({ userId }: WatchListProps) => {
  const { user } = useAuth()

  const { data: watchList, isLoading } = useQuery({
    queryKey: ['watch-list', userId],
    queryFn: async () => getWatchList({ user_id: userId }),
  })

  if (isLoading)
    return (
      <div className="grid w-1/2 grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <WatchListItemCardSkeleton key={index} />
        ))}
      </div>
    )

  const isOwner = user?.id === userId

  const isVisitorAndListEmpty = watchList && watchList.length === 0 && !isOwner

  if (!watchList && isOwner && userId) {
    return (
      <div className="justify flex w-full flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>You don&apos;t have a Watchlist yet.</p>
        <WatchListModalSearch userId={userId} />
      </div>
    )
  }

  if (isVisitorAndListEmpty || !watchList) {
    return (
      <div className="justify flex w-full flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>This user doesn&apos;t have a Watchlist yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {isOwner && userId && (
          <div className="flex">
            <WatchListModalSearch userId={userId} />
          </div>
        )}

        <div className="grid w-1/2 grid-cols-1 gap-4 lg:grid-cols-4 lg:w-full">
          {watchList.map((item) => (
            <WatchListItemCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </>
  )
}
