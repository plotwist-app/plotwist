'use client'

import { useGetUserIdWatchedGenresSuspense } from '@/api/user-stats'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { BarChartHorizontal } from 'lucide-react'
import { useLayoutContext } from '../_context'
import { useLanguage } from '@/context/language'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import { v4 } from 'uuid'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

export function Genres() {
  const { userId } = useLayoutContext()
  const { language, dictionary } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const { data } = useGetUserIdWatchedGenresSuspense(userId, { language })

  const trigger = (
    <p className="mt-4 cursor-pointer text-end text-xs text-muted-foreground hover:underline">
      {dictionary.see_all_genres}
    </p>
  )

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.most_watched_genres}
        </CardTitle>
        <BarChartHorizontal className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="">
        <div className="space-y-4">
          {data.genres.slice(0, 3).map(({ count, name, percentage }) => (
            <div className="space-y-2" key={name}>
              <div className="flex justify-between text-xs">
                <span>{name}</span>

                <span className="text-muted-foreground">
                  {percentage.toFixed(2)}% ({count})
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          ))}
        </div>

        {isDesktop ? (
          <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="p-0 gap-0 max-w-96">
              <DialogTitle className="pt-4 px-4">
                {dictionary.most_watched_genres}
              </DialogTitle>

              <ScrollArea className="h-[50vh] p-4">
                <div className="space-y-4">
                  {data.genres.map(({ count, name, percentage }) => (
                    <div className="space-y-2" key={name}>
                      <div className="flex justify-between text-sm">
                        <span>{name}</span>

                        <span className="text-muted-foreground">
                          {percentage.toFixed(2)}% ({count})
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>

            <DrawerContent className="space-y-0">
              <DrawerTitle className="text-center pt-4 px-4">
                {dictionary.most_watched_genres}
              </DrawerTitle>

              <ScrollArea className="h-[50vh] p-4">
                <div className="space-y-4">
                  {data.genres.map(({ count, name, percentage }) => (
                    <div className="space-y-2" key={name}>
                      <div className="flex justify-between text-sm">
                        <span>{name}</span>

                        <span className="text-muted-foreground">
                          {percentage.toFixed(2)}% ({count})
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        )}
      </CardContent>
    </Card>
  )
}

export function GenresSkeleton() {
  const { dictionary } = useLanguage()

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.most_watched_genres}
        </CardTitle>

        <BarChartHorizontal className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map(_ => (
            <div className="space-y-2" key={v4()}>
              <div className="flex justify-between text-xs">
                <Skeleton className="w-[10ch] h-[1.5ex]" />

                <Skeleton className="w-[5ch] h-[1.5ex]" />
              </div>
              <Progress value={50} />
            </div>
          ))}

          <p className="mt-4 text-end text-xs text-muted-foreground">
            {dictionary.see_all_genres}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
