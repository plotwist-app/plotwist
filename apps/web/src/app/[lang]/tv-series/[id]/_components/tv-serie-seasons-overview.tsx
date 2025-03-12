'use client'

import type { Language, Season } from '@plotwist_app/tmdb'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { tmdb } from '@/services/tmdb'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { ScrollArea, ScrollBar } from '@plotwist/ui/components/ui/scroll-area'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@plotwist/ui/components/ui/table'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { v4 } from 'uuid'

type TvSerieSeasonsOverviewProps = {
  seasons: Season[]
}

async function getSeasonDetails(
  tvSerieId: number,
  seasons: Season[],
  language: Language
) {
  const seasonsDetails = await Promise.all(
    seasons.map(
      async season =>
        await tmdb.season.details(tvSerieId, season.season_number, language)
    )
  )

  const formattedSeasonsDetails = seasonsDetails.map(season => {
    return {
      ...season,
      episodes: season.episodes.map((episode, episodeIndex) => ({
        ...episode,
        episode_number: episodeIndex + 1,
      })),
    }
  })

  return formattedSeasonsDetails
}

export function TvSerieSeasonsOverview({
  seasons,
}: TvSerieSeasonsOverviewProps) {
  const params = useParams<{ id: string }>()
  const { language } = useLanguage()

  const { data } = useSuspenseQuery({
    queryKey: ['tv-serie-seasons-details', params.id, language],
    queryFn: () => getSeasonDetails(Number(params.id), seasons, language),
  })

  const episodesLengths = data.map(season => season.episodes.length)
  const maxEpisodes = Math.max(...episodesLengths)

  return (
    <ScrollArea className="!overflow-auto relative h-[80vh] max-w-4xl ">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-border">
          <TableRow className="border-0 text-xs">
            <TableHead
              className={cn(
                'p-2 text-center sticky top-0 left-0 bg-background',
                'after:absolute after:right-0 after:w-[1px] after:h-[120%] after:top-0 after:bg-border'
              )}
            >
              EP
            </TableHead>

            {seasons.map(season => (
              <TableHead key={season.season_number} className="p-2 text-center">
                S{season.season_number}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="relative">
          {[...Array(maxEpisodes)].map((_, episodeIndex) => (
            <TableRow key={v4()}>
              <TableCell
                className={cn(
                  'p-2 text-center font-medium sticky left-0 bg-background text-muted-foreground text-xs',
                  'after:absolute after:right-0 after:w-[1px] after:h-[120%] after:top-0 after:bg-border'
                )}
              >
                {episodeIndex + 1}
              </TableCell>

              {seasons.map(season => {
                const seasonDetails = data.find(
                  seasonDetail =>
                    seasonDetail.season_number === season.season_number
                )

                const episode = seasonDetails?.episodes.find(
                  episode => episode.episode_number === episodeIndex + 1
                )

                if (!episode || episode.vote_average === 0) {
                  return (
                    <TableCell
                      key={season.season_number}
                      className="p-2 text-center text-sm text-muted-foreground"
                    >
                      -
                    </TableCell>
                  )
                }

                return (
                  <TableCell
                    key={season.season_number}
                    className="p-2 text-center text-sm"
                  >
                    <Badge
                      className={cn(
                        'font-medium',
                        episode.vote_average > 0 &&
                          'bg-red-200 text-red-900 hover:bg-red-300 dark:bg-red-700/50 dark:text-red-100 dark:hover:bg-red-700',
                        episode.vote_average > 2 &&
                          'bg-orange-200 text-orange-900 hover:bg-orange-300 dark:bg-orange-700/50 dark:text-orange-100 dark:hover:bg-orange-700',
                        episode.vote_average > 4 &&
                          'bg-yellow-200 text-yellow-900 hover:bg-yellow-300 dark:bg-yellow-700/50 dark:text-yellow-100 dark:hover:bg-yellow-700',
                        episode.vote_average > 6 &&
                          'bg-lime-200 text-lime-900 hover:bg-lime-300 dark:bg-lime-700/50 dark:text-lime-100 dark:hover:bg-lime-700',
                        episode.vote_average > 8 &&
                          'bg-green-200 text-green-900 hover:bg-green-300 dark:bg-green-700/50 dark:text-green-100 dark:hover:bg-green-700'
                      )}
                    >
                      {episode?.vote_average.toFixed(1)}
                    </Badge>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

type TvSerieSeasonsOverviewSkeletonProps = {
  seasons: Season[]
}

export function TvSerieSeasonsOverviewSkeleton({
  seasons,
}: TvSerieSeasonsOverviewSkeletonProps) {
  const maxEpisodes = Math.max(...seasons.map(season => season.episode_count))

  return (
    <ScrollArea className="!overflow-auto relative h-[80vh] max-w-4xl">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-border">
          <TableRow className="border-0 text-xs">
            <TableHead
              className={cn(
                'p-2 text-center sticky top-0 left-0 bg-background',
                'after:absolute after:right-0 after:w-[1px] after:h-[120%] after:top-0 after:bg-border'
              )}
            >
              EP
            </TableHead>

            {seasons.map(season => (
              <TableHead key={season.season_number} className="p-2 text-center">
                S{season.season_number}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="relative">
          {Array.from({ length: maxEpisodes }).map((_, episodeIndex) => (
            <TableRow key={v4()}>
              <TableCell
                className={cn(
                  'p-2 text-center font-medium sticky left-0 bg-background text-muted-foreground text-xs',
                  'after:absolute after:right-0 after:w-[1px] after:h-[120%] after:top-0 after:bg-border'
                )}
              >
                {episodeIndex + 1}
              </TableCell>

              {seasons.map(season => {
                return (
                  <TableCell
                    key={season.season_number}
                    className="p-2 text-center text-sm"
                  >
                    <Skeleton className="w-[40px] h-[22px] m-auto" />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
