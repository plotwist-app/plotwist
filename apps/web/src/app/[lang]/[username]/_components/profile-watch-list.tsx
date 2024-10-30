'use client'

import { useAuth } from '@/context/auth'
import { useQuery } from '@tanstack/react-query'
import { getWatchList } from '@/services/api/watch-list'
import { Button } from '@plotwist/ui/components/ui/button'
import { useState } from 'react'
import {
  WatchListItemCardSkeleton,
  WatchListItemCard,
} from './profile-watch-list-item-card'

type WatchListProps = {
  userId: string
}

export const WatchList = ({ userId }: WatchListProps) => {
  const { user } = useAuth()

  const [open, setOpen] = useState(false)

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

  if (isVisitorAndListEmpty || !watchList) {
    return (
      <div className="justify flex w-full flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>You don&apos;t have a WatchList yet.</p>
        <Button onClick={() => setOpen(true)}>
          Add your first movie/serie
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <Button className="w-fit" variant="outline">
          Add more movies or series
        </Button>
      </div>

      <div className="grid w-1/2 grid-cols-1 gap-4 lg:grid-cols-2">
        {watchList.map((item) => (
          <WatchListItemCard item={item} key={item.id} setOpen={setOpen} />
        ))}
      </div>
    </div>
  )
}
