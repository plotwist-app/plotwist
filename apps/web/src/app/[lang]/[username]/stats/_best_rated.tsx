'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { useMediaQuery } from '@uidotdev/usehooks'
import { format } from 'date-fns'
import { Star } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { v4 } from 'uuid'
import { useGetUserIdBestReviewsSuspense } from '@/api/user-stats'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { useLayoutContext } from '../_context'

export function BestRated() {
  const { userId } = useLayoutContext()
  const { language, dictionary } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data } = useGetUserIdBestReviewsSuspense(userId, { language })

  if (!data.bestReviews.length) return <></>

  const trigger = (
    <p
      className={cn(
        'mt-4 cursor-pointer text-end text-xs text-muted-foreground hover:underline',
        data.bestReviews.length < 7 && 'hidden'
      )}
    >
      {dictionary.more}
    </p>
  )

  function renderContent(end: number) {
    return (
      <div className="space-y-4">
        {data.bestReviews
          .slice(0, end)
          .map(({ title, rating, mediaType, id, tmdbId, date }) => (
            <div
              key={id}
              className="flex text-sm items-start justify-between gap-4"
            >
              <div>
                <Link
                  href={`/${language}/${mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${tmdbId}?review=${id}`}
                  className="font-medium hover:underline line-clamp-1"
                >
                  {title}
                </Link>

                {date && (
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(date), 'yyyy')}
                  </p>
                )}
              </div>

              <div className="flex items-center mt-1.5">
                {Array.from({ length: rating }).map(() => (
                  <StarFilledIcon
                    className="size-3.5 text-amber-400 fill-amber-400 mr-0"
                    key={v4()}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <Card className="sm:col-span-1 col-span-2">
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {dictionary.best_reviews}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dictionary.best_reviews_description}
          </p>
        </div>
        <Star className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-2">
        {renderContent(7)}

        {isDesktop ? (
          <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="p-0 gap-0 max-w-96">
              <DialogHeader className="pt-4 px-4">
                <DialogTitle>{dictionary.best_reviews}</DialogTitle>
                <DialogDescription>
                  {dictionary.best_reviews_description}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="h-[50vh] p-4">
                {renderContent(Number.POSITIVE_INFINITY)}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>

            <DrawerContent className="space-y-0 p-0">
              <DrawerHeader className="text-center px-4 pt-4">
                <DrawerTitle>{dictionary.best_reviews}</DrawerTitle>
                <DrawerDescription>
                  {dictionary.best_reviews_description}
                </DrawerDescription>
              </DrawerHeader>

              <ScrollArea className="h-[50vh] p-4">
                {renderContent(Number.POSITIVE_INFINITY)}
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        )}
      </CardContent>
    </Card>
  )
}

export function BestRatedSkeleton() {
  const { dictionary } = useLanguage()

  const trigger = (
    <p className="mt-4 text-end text-xs text-muted-foreground hover:underline opacity-50">
      {dictionary.more}
    </p>
  )

  return (
    <Card className="sm:col-span-1 col-span-2">
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {dictionary.best_reviews}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dictionary.best_reviews_description}
          </p>
        </div>
        <Star className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-2">
        <div className="space-y-4">
          {Array.from({ length: 7 }).map(() => (
            <div
              key={v4()}
              className="flex text-sm items-start justify-between gap-4"
            >
              <div className="space-y-2">
                <Skeleton className="w-[20ch] h-[2.5ex]" />
                <Skeleton className="w-[4ch] h-[1.6ex]" />
              </div>

              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }).map(() => (
                  <StarFilledIcon
                    className="size-3.5 text-amber-400 fill-amber-400 mr-0"
                    key={v4()}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {trigger}
      </CardContent>
    </Card>
  )
}
