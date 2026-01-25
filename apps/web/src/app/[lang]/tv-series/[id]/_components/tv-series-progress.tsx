'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionPrimitive,
} from '@plotwist/ui/components/ui/accordion'
import { Button } from '@plotwist/ui/components/ui/button'
import { Checkbox } from '@plotwist/ui/components/ui/checkbox'
import { ConfettiButton } from '@plotwist/ui/components/ui/confetti'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { useQueryClient } from '@tanstack/react-query'
import { isBefore } from 'date-fns'
import { Check, CheckCircle2Icon, ChevronDownIcon } from 'lucide-react'
import { useRef } from 'react'
import {
  useDeleteUserEpisodes,
  useGetUserEpisodesSuspense,
  usePostUserEpisodes,
} from '@/api/user-episodes'
import { useGetUserItemSuspense, usePutUserItem } from '@/api/user-items'
import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import type { Episode, SeasonDetails } from '@/services/tmdb'

type TvSeriesProgressProps = {
  seasonsDetails: SeasonDetails[]
  tmdbId: number
}

export function TvSeriesProgress({
  seasonsDetails,
  tmdbId,
}: TvSeriesProgressProps) {
  const {
    data: userEpisodes,
    queryKey: userEpisodesQueryKey,
    refetch: refetchUserEpisodes,
  } = useGetUserEpisodesSuspense({
    tmdbId: String(tmdbId),
  })

  const {
    data: userItemData,
    queryKey: userItemQueryKey,
    refetch: refetchUserItems,
  } = useGetUserItemSuspense({
    mediaType: 'TV_SHOW',
    tmdbId: String(tmdbId),
  })

  const putUserItem = usePutUserItem()
  const createUserEpisode = usePostUserEpisodes()
  const deleteUserEpisode = useDeleteUserEpisodes()

  const confettiButtonRef = useRef<HTMLButtonElement>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { dictionary } = useLanguage()

  const totalEpisodes = seasonsDetails.reduce(
    (acc, current) => acc + current.episodes.length,
    0
  )

  const watchedCount = userEpisodes?.length || 0
  const progressPercentage = (watchedCount / totalEpisodes) * 100
  const isAllEpisodesWatched = watchedCount === totalEpisodes

  const queryClient = useQueryClient()

  async function invalidateUserEpisodes() {
    const { data } = await refetchUserEpisodes()
    queryClient.setQueryData(userEpisodesQueryKey, data)

    await updateUserItemStatus(data?.length || 0)
  }

  async function invalidateUserItem() {
    const { data } = await refetchUserItems()
    queryClient.setQueryData(userItemQueryKey, data)
  }

  function findUserEpisode(episode: Episode) {
    return userEpisodes?.find(userEpisode => {
      return (
        userEpisode.seasonNumber === episode.season_number &&
        userEpisode.episodeNumber === episode.episode_number
      )
    })
  }

  async function handleToggleSeason(episodes: Episode[]) {
    const isAllEpisodesWatched = episodes.every(episode =>
      findUserEpisode(episode)
    )

    if (isAllEpisodesWatched) {
      const episodesToDelete = episodes
        .map(episode => findUserEpisode(episode)?.id)
        .filter(id => id !== undefined)

      if (episodesToDelete.length > 0) {
        await deleteUserEpisode.mutateAsync({
          data: { ids: episodesToDelete },
        })
      }
    }

    if (!isAllEpisodesWatched) {
      const episodesToCreate = episodes.filter(
        episode => !findUserEpisode(episode)
      )

      if (episodesToCreate.length > 0) {
        await createUserEpisode.mutateAsync({
          data: episodesToCreate.map(episode => ({
            episodeNumber: episode.episode_number,
            seasonNumber: episode.season_number,
            tmdbId: episode.show_id,
            runtime: episode.runtime,
          })),
        })
      }
    }

    await queryClient.invalidateQueries({})
    await invalidateUserEpisodes()
  }

  async function handleToggleEpisode(episode: Episode) {
    const userEpisode = findUserEpisode(episode)

    if (userEpisode) {
      await deleteUserEpisode.mutateAsync({ data: { ids: [userEpisode.id] } })
    }

    if (!userEpisode) {
      await createUserEpisode.mutateAsync({
        data: [
          {
            episodeNumber: episode.episode_number,
            seasonNumber: episode.season_number,
            tmdbId: episode.show_id,
            runtime: episode.runtime,
          },
        ],
      })
    }

    await invalidateUserEpisodes()
  }

  const updateUserItemStatus = async (watchedEpisodes: number) => {
    const watchedAllEpisodes = watchedEpisodes === totalEpisodes

    if (watchedAllEpisodes) {
      const statusIsWatched = userItemData?.userItem?.status !== 'WATCHED'

      if (statusIsWatched) {
        await putUserItem.mutateAsync(
          { data: { mediaType: 'TV_SHOW', status: 'WATCHED', tmdbId } },
          {
            onSuccess: async () => {
              await invalidateUserItem()

              confettiButtonRef.current?.click()
            },
          }
        )
      }
    }

    const isWatching =
      !watchedAllEpisodes &&
      watchedCount > 0 &&
      userItemData?.userItem?.status !== 'WATCHING'

    if (isWatching) {
      await putUserItem.mutateAsync(
        {
          data: { mediaType: 'TV_SHOW', status: 'WATCHING', tmdbId },
        },
        {
          onSuccess: async () => {
            await invalidateUserItem()
          },
        }
      )
    }
  }

  const content = (
    <div className="relative">
      <ConfettiButton
        ref={confettiButtonRef}
        className="opacity-0 h-0 top-0 absolute w-full pointer-events-none"
      />

      <div className="space-y-4 px-4 pt-4">
        <div className="flex gap-2 items-center">
          {isDesktop ? (
            <DialogTitle className="font-medium">
              {dictionary.overall_progress}
            </DialogTitle>
          ) : (
            <DrawerTitle className="font-medium">
              {dictionary.overall_progress}
            </DrawerTitle>
          )}

          <Separator orientation="vertical" className="h-4" />

          <span className="text-sm text-muted-foreground ">
            {userEpisodes?.length}/{totalEpisodes} {dictionary.episodes}
          </span>
        </div>

        <Progress
          value={progressPercentage}
          className="w-full [&>*]:bg-emerald-400"
        />

        <div className="text-sm items-center text-muted-foreground ">
          <span>
            {dictionary.when_you_mark_all_episodes} <b>{dictionary.watched}</b>.
          </span>
        </div>
      </div>

      <ScrollArea className="h-[50vh] scroll-y-auto px-4">
        <Accordion type="single" collapsible>
          {seasonsDetails.map(season => {
            const releasedEpisodes = season.episodes.filter(
              ({ air_date }) =>
                Boolean(air_date) && isBefore(new Date(air_date), new Date())
            )

            const hasReleasedEpisodes = releasedEpisodes.length > 0

            const allReleasedWatched =
              hasReleasedEpisodes &&
              releasedEpisodes.every(episode =>
                Boolean(findUserEpisode(episode))
              )

            return (
              <AccordionItem value={season.name} key={season.id}>
                <div
                  className={cn(
                    'flex items-center justify-between py-4 text-sm font-medium transition-all [&[data-state=open]_svg]:rotate-18',
                    !hasReleasedEpisodes && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={String(season.id)}
                      checked={allReleasedWatched}
                      disabled={!hasReleasedEpisodes}
                      onCheckedChange={() =>
                        handleToggleSeason(releasedEpisodes)
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
                    {season.episodes.map(episode => {
                      const {
                        id,
                        episode_number: number,
                        name,
                        air_date: airDate,
                      } = episode

                      const episodeId = String(id)
                      const isWatched = Boolean(findUserEpisode(episode))

                      const isReleased =
                        Boolean(airDate) &&
                        isBefore(new Date(airDate), new Date())

                      const isDisabled = !isReleased

                      return (
                        <li
                          className={cn(
                            'flex items-center space-x-2',
                            isDisabled && 'opacity-50'
                          )}
                          key={episodeId}
                        >
                          <Checkbox
                            id={episodeId}
                            checked={isWatched}
                            disabled={isDisabled}
                            onCheckedChange={() => handleToggleEpisode(episode)}
                          />

                          <label
                            htmlFor={episodeId}
                            className={cn(
                              'flex-grow cursor-pointer',
                              isWatched && 'line-through'
                            )}
                          >
                            {number}. {name}
                          </label>

                          {isWatched && (
                            <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                          )}
                        </li>
                      )
                    })}
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
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Check className="mr-2" size={14} />
            {isAllEpisodesWatched
              ? dictionary.progress_completed
              : dictionary.update_progress}
          </Button>
        </DialogTrigger>

        <DialogContent
          className="p-0 max-w-lg"
          aria-describedby={dictionary.update_progress}
        >
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline">
          <Check className="mr-2" size={14} />
          {isAllEpisodesWatched
            ? dictionary.progress_completed
            : dictionary.update_progress}{' '}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0">{content}</DrawerContent>
    </Drawer>
  )
}
