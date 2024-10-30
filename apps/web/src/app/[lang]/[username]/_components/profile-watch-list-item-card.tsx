'use client'

import { Banner } from '@/components/banner'
import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import { WatchListItem, useWatchList } from '@/hooks/use-watch-list'
import { tmdbImage } from '@/utils/tmdb/image'
import { tmdb } from '@plotwist/tmdb'
import { Button } from '@plotwist/ui/components/ui/button'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@plotwist/ui/components/ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import { Eye, ImageIcon, StarIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogTrigger } from '@plotwist/ui/components/ui/dialog'
import { ProfileReviewModal } from './profile-review-modal'
import { useMemo, useState } from 'react'

interface WatchListItemCardProps {
  item: Omit<WatchListItem, 'user_id'>
  isOwner: boolean
}

export const WatchListItemCard = ({
  item,
  isOwner,
}: WatchListItemCardProps) => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const { handleRemoveFromWatchList } = useWatchList({ userId: user?.id || '' })

  const [markAsWatchedModalOpen, setMarkAsWatchedModalOpen] = useState(false)

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
    enabled: Boolean(item.tmdb_id),
  })

  const posterUrl = useMemo(() => {
    if (!itemData?.poster_path) return ''
    return tmdbImage(itemData.poster_path, 'w500')
  }, [itemData?.poster_path])

  if (isLoading) return <WatchListItemCardSkeleton />
  if (!itemData) return null

  return (
    <div className="group relative space-y-0.5 sm:space-y-2">
      <div className="aspect-poster w-full overflow-hidden rounded-md border bg-card/50">
        {itemData.poster_path ? (
          <Banner
            className="z-10 object-fill hover:scale-105 transition-all duration-300"
            url={posterUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-6 sm:size-8 text-muted-foreground" />
          </div>
        )}

        {isOwner && (
          <div className="absolute inset-0 flex items-end justify-end opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent p-0.5 sm:p-2">
            <TooltipProvider>
              <div className="flex gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-5 sm:size-8 bg-background"
                      disabled
                    >
                      <Eye className="size-2.5 sm:size-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent className="bg-background border-accent text-muted-foreground text-[10px] sm:text-sm">
                    <p>Mark as watched</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <Dialog
                    open={markAsWatchedModalOpen}
                    onOpenChange={setMarkAsWatchedModalOpen}
                  >
                    <DialogTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-5 sm:size-8 bg-background hover:text-yellow-300"
                          onClick={() => setMarkAsWatchedModalOpen(true)}
                        >
                          <StarIcon className="size-2.5 sm:size-4" />
                        </Button>
                      </TooltipTrigger>
                    </DialogTrigger>

                    <TooltipContent className="bg-background border-accent text-muted-foreground text-[10px] sm:text-sm">
                      <p>Review it now</p>
                    </TooltipContent>

                    <ProfileReviewModal
                      setOpen={setMarkAsWatchedModalOpen}
                      tmdbItem={itemData}
                      mediaType={item.type}
                    />
                  </Dialog>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-5 sm:size-8 bg-background hover:text-red-300"
                      onClick={() => {
                        handleRemoveFromWatchList.mutate(
                          { tmdb_id: item.tmdb_id, user_id: user?.id || '' },
                          {
                            onSuccess: () =>
                              toast.success('Removed from watchlist'),
                            onError: () =>
                              toast.error('Failed to remove from watchlist'),
                          },
                        )
                      }}
                    >
                      <Trash2 className="size-2.5 sm:size-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent className="bg-background border-accent text-muted-foreground text-[10px] sm:text-sm">
                    <p>Remove from watchlist</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}

export const WatchListItemCardSkeleton = () => {
  return (
    <div className="group relative space-y-1 sm:space-y-2">
      <div className="aspect-poster w-full overflow-hidden rounded-md border bg-card/50">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}
