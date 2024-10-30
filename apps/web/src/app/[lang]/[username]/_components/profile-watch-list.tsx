'use client'

import { useAuth } from '@/context/auth'
import { getWatchList } from '@/services/api/watch-list'
import { useQuery } from '@tanstack/react-query'
import {
  WatchListItemCard,
  WatchListItemCardSkeleton,
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <WatchListItemCardSkeleton key={index} />
        ))}
      </div>
    )

  const isOwner = user?.id === userId

  const isVisitorAndListEmpty = watchList && watchList.length === 0 && !isOwner

  if (!watchList && isOwner && userId) {
    return (
      <div className="flex w-full flex-col items-center justify-center space-y-2 rounded-md border border-dashed px-4 py-6 sm:py-8 text-center">
        <p className="text-sm sm:text-base">
          You don&apos;t have a Watchlist yet.
        </p>
        <WatchListModalSearch userId={userId} />
      </div>
    )
  }

  if (isVisitorAndListEmpty || !watchList) {
    return (
      <div className="flex w-full flex-col items-center justify-center space-y-2 rounded-md border border-dashed px-4 py-6 sm:py-8 text-center">
        <p className="text-sm sm:text-base">
          This user doesn&apos;t have a Watchlist yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {isOwner && userId && (
        <div className="flex w-full">
          <WatchListModalSearch userId={userId} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {watchList.map((item) => (
          <WatchListItemCard item={item} key={item.id} isOwner={isOwner} />
        ))}
      </div>
    </div>
  )
}
