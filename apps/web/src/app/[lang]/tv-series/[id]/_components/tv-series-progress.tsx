'use client'

import { cn } from '@/lib/utils'
import { SeasonDetails } from '@/services/tmdb'
import {
  AccordionContent,
  Accordion,
  AccordionItem,
  AccordionPrimitive,
} from '@plotwist/ui/components/ui/accordion'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { isBefore } from 'date-fns'
import { CheckCircle2Icon, ChevronDownIcon } from 'lucide-react'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { ConfettiButton } from '@plotwist/ui/components/ui/confetti'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'

type TvSeriesProgressProps = {
  seasonsDetails: SeasonDetails[]
} & PropsWithChildren

export function TvSeriesProgress({
  seasonsDetails,
  children,
}: TvSeriesProgressProps) {
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set())
  const confettiButtonRef = useRef<HTMLButtonElement>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const totalEpisodes = seasonsDetails.reduce(
    (acc, current) => acc + current.episodes.length,
    0,
  )

  const watchedCount = watchedEpisodes.size
  const progressPercentage = (watchedCount / totalEpisodes) * 100

  const toggleEpisode = (episodeId: string) => {
    setWatchedEpisodes((prev) => {
      const newSet = new Set(prev)

      if (newSet.has(episodeId)) {
        newSet.delete(episodeId)
      } else {
        newSet.add(episodeId)
      }

      return newSet
    })
  }

  const toggleSeason = (seasonId: string, episodeIds: string[]) => {
    setWatchedEpisodes((prev) => {
      const newSet = new Set(prev)
      const allEpisodesWatched = episodeIds.every((id) => newSet.has(id))

      if (allEpisodesWatched) {
        episodeIds.forEach((id) => newSet.delete(id))
      } else {
        episodeIds.forEach((id) => newSet.add(id))
      }

      return newSet
    })
  }

  useEffect(() => {
    if (watchedCount === totalEpisodes) {
      confettiButtonRef.current?.click()
    }
  }, [watchedCount, totalEpisodes])

  const content = (
    <div className="relative">
      <ConfettiButton
        ref={confettiButtonRef}
        className="opacity-0 h-0 top-0 absolute w-full pointer-events-none"
      />

      <div className="space-y-2 px-4 pt-4">
        <div className="flex gap-2 items-center">
          <span className="font-medium">Progresso geral</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            {watchedEpisodes.size}/{totalEpisodes} episódios
          </span>
        </div>

        <Progress value={progressPercentage} className="w-full" />
      </div>

      <ScrollArea className="h-[50vh] scroll-y-auto px-4">
        <Accordion type="single" collapsible>
          {seasonsDetails.map((season) => {
            const episodeIds = season.episodes.map((e) => String(e.id))
            const allEpisodesWatched = episodeIds.every((id) =>
              watchedEpisodes.has(id),
            )

            return (
              <AccordionItem value={season.name} key={season.id}>
                <div className="flex items-center justify-between py-4 text-sm font-medium transition-all [&[data-state=open]_svg]:rotate-18">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={String(season.id)}
                      checked={allEpisodesWatched}
                      onCheckedChange={() =>
                        toggleSeason(String(season.id), episodeIds)
                      }
                    />

                    <AccordionPrimitive.Trigger className="hover:underline text-start">
                      {season.name}
                    </AccordionPrimitive.Trigger>
                  </div>

                  <AccordionPrimitive.Trigger>
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </div>

                <AccordionContent>
                  <ul className="space-y-4 pl-6">
                    {season.episodes.map(
                      ({
                        id,
                        episode_number: number,
                        name,
                        air_date: airDate,
                      }) => {
                        const episodeId = String(id)
                        const isWatched = watchedEpisodes.has(episodeId)
                        const isReleased = isBefore(
                          new Date(airDate),
                          new Date(),
                        )
                        const isDisabled = !isReleased

                        return (
                          <li
                            className={cn(
                              'flex items-center space-x-2',
                              isDisabled && 'opacity-50',
                            )}
                            key={episodeId}
                          >
                            <Checkbox
                              id={episodeId}
                              checked={isWatched}
                              disabled={isDisabled}
                              onCheckedChange={() => toggleEpisode(episodeId)}
                            />

                            <label
                              htmlFor={episodeId}
                              className={cn(
                                `flex-grow cursor-pointer`,
                                isWatched && 'line-through',
                              )}
                            >
                              {number}. {name}
                            </label>

                            {isWatched && (
                              <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                            )}
                          </li>
                        )
                      },
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-0 max-w-lg">{content}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="p-0">{content}</DrawerContent>
    </Drawer>
  )
}
