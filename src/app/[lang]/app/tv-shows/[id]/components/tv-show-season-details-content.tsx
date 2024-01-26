'use client'

import { useState } from 'react'

import { Grid, Table as LucideTable } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { TvShowEpisodeCard } from './tv-show-season-episode-card'
import { Badge } from '@/components/ui/badge'

import { Episode } from '@/services/tmdb2/requests/tv-seasons/details'

type TvShowSeasonDetailsContentProps = {
  episodes: Episode[]
}

type Layout = 'grid' | 'table'

export const TvShowSeasonDetailsContent = ({
  episodes,
}: TvShowSeasonDetailsContentProps) => {
  const [layout, setLayout] = useState<Layout>('grid')

  const contentByLayout: Record<Layout, JSX.Element> = {
    grid: (
      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
        {episodes.map((episode) => (
          <TvShowEpisodeCard episode={episode} key={episode.id} />
        ))}
      </div>
    ),
    table: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[1ch]"></TableHead>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[400px]">Overview</TableHead>
            <TableHead>Runtine</TableHead>
            <TableHead className="text-right">Vote</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {episodes.map((episode, index) => (
            <TableRow key={episode.id}>
              <TableCell className="font-bold text-muted-foreground">
                {index + 1}.
              </TableCell>

              <TableCell className="w-[200px] font-medium">
                {episode.name}
              </TableCell>

              <TableCell>
                <p className="text-xs text-muted-foreground">
                  {episode.overview}
                </p>
              </TableCell>

              <TableCell>{episode.runtime}m</TableCell>

              <TableCell className="text-right">
                <Badge variant="outline">
                  {episode.vote_average.toFixed(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className="h-8 w-8"
                size="icon"
                variant={layout === 'grid' ? 'default' : 'outline'}
                onClick={() => setLayout('grid')}
              >
                <Grid size={18} />
              </Button>
            </TooltipTrigger>

            <TooltipContent>Grid layout</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className="h-8 w-8"
                size="icon"
                variant={layout === 'table' ? 'default' : 'outline'}
                onClick={() => setLayout('table')}
              >
                <LucideTable size={18} />
              </Button>
            </TooltipTrigger>

            <TooltipContent>Table layout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {contentByLayout[layout]}
    </div>
  )
}
