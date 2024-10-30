'use client'

import { useLanguage } from '@/context/language'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { WatchListItem } from '@/hooks/use-watch-list'
import { useQuery } from '@tanstack/react-query'
import { tmdb } from '@plotwist/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'
import { Banner } from '@/components/banner'
import { ImageIcon } from 'lucide-react'

interface WatchListItemCardProps {
  item: Omit<WatchListItem, 'user_id'>
}

export const WatchListItemCard = ({ item }: WatchListItemCardProps) => {
  const { language } = useLanguage()

  const { data: itemData, isLoading } = useQuery({
    queryKey: ['watch-list-item', item.tmdb_id],
    queryFn: async () => {
      try {
        return item.type === 'MOVIE'
          ? await tmdb.movies.details(Number(item.tmdb_id), language)
          : await tmdb.tv.details(Number(item.tmdb_id), language)
      } catch (error) {
        console.error('Error fetching item details:', error)
        return null
      }
    },
    enabled: Boolean(item.tmdb_id), // Only run query if we have an ID
  })

  if (isLoading) return <WatchListItemCardSkeleton />
  if (!itemData) return null

  return (
    <div className="group relative space-y-2">
      <div className="aspect-poster w-full overflow-hidden rounded-md border bg-card/50">
        {itemData.poster_path ? (
          <Banner
            className="z-10 object-fill hover:scale-105 transition-all duration-300"
            url={tmdbImage(itemData.poster_path, 'w500')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}

export const WatchListItemCardSkeleton = () => {
  return (
    <div className="group relative space-y-2">
      <div className="aspect-poster w-full overflow-hidden rounded-md border bg-card/50">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}
