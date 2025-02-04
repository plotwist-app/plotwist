'use client'

import type { Language, Season } from '@plotwist_app/tmdb'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@plotwist/ui/components/ui/table'
import { v4 } from 'uuid'
import { tmdb } from '@/services/tmdb'
import { useLanguage } from '@/context/language'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'

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

  return seasonsDetails
}

export function TvSerieSeasonsOverview({
  seasons,
}: TvSerieSeasonsOverviewProps) {
  const params = useParams<{ id: string }>()
  const { language } = useLanguage()

  const maxEpisodes = Math.max(...seasons.map(season => season.episode_count))

  const { data } = useQuery({
    queryKey: ['tv-serie-seasons-details', params.id, language],
    queryFn: () => getSeasonDetails(Number(params.id), seasons, language),
  })

  return (
    <ScrollArea className="overflow-y-auto relative h-[80vh]">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-border ">
          <TableRow className="border-0">
            <TableHead className="p-2 text-center">EP</TableHead>

            {seasons.map(season => (
              <TableHead key={season.season_number} className="p-2 text-center">
                S{season.season_number}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {[...Array(maxEpisodes)].map((_, episodeIndex) => (
            <TableRow key={v4()}>
              <TableCell className="p-2 text-center font-medium">
                {episodeIndex + 1}
              </TableCell>

              {seasons.map(season => {
                const seasonDetails = data?.find(
                  seasonDetail =>
                    seasonDetail.season_number === season.season_number
                )

                const episode = seasonDetails?.episodes.find(
                  episode => episode.episode_number === episodeIndex + 1
                )

                if (!episode) {
                  return (
                    <TableCell
                      key={season.season_number}
                      className="p-2 text-center text-sm"
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
                        episode.vote_average > 0 &&
                          'bg-red-200 text-red-900 hover:bg-red-400',
                        episode.vote_average > 2 &&
                          'bg-orange-200 text-orange-900 hover:bg-orange-400',
                        episode.vote_average > 4 &&
                          'bg-yellow-200 text-yellow-900 hover:bg-yellow-400',
                        episode.vote_average > 6 &&
                          'bg-lime-200 text-lime-900 hover:bg-lime-400',
                        episode.vote_average > 8 &&
                          'bg-green-200 text-green-900 hover:bg-green-400'
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
    </ScrollArea>
  )
}
