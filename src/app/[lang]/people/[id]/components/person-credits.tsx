'use client'

import { tmdb } from '@/services/tmdb'
import { DataTable } from './data-table'
import { columns } from './data-table/data-table-columns'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/language'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Grid, Table as LucideTable } from 'lucide-react'
import { useState } from 'react'

type PersonCreditsProps = { personId: number }
type Layout = 'grid' | 'table'

export const PersonCredits = ({ personId }: PersonCreditsProps) => {
  const [castLayout, setCastLayout] = useState<Layout>('grid')
  const [crewLayout, setCrewLayout] = useState<Layout>('grid')
  const { dictionary, language } = useLanguage()

  const { data } = useQuery({
    queryKey: [personId],
    queryFn: () => tmdb.person.combinedCredits(personId, language),
  })

  if (!data) return <></>

  const crewContentByLayout: Record<Layout, JSX.Element> = {
    grid: (
      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
        <p>grid layout</p>
        {/* {episodes.map((episode) => ( */}
        {/*   <TvSerieEpisodeCard episode={episode} key={episode.id} /> */}
        {/* ))} */}
      </div>
    ),
    table: (
      <>
        <p>table layout</p>
        <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>
        <DataTable columns={columns(dictionary, language)} data={data.crew} />
      </>
    ),
  }

  const castContentByLayout: Record<Layout, JSX.Element> = {
    grid: (
      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
        <p>grid layout</p>
        {/* {episodes.map((episode) => ( */}
        {/*   <TvSerieEpisodeCard episode={episode} key={episode.id} /> */}
        {/* ))} */}
      </div>
    ),
    table: (
      <>
        <p>table layout</p>
        <h5 className="text-xl font-bold">{dictionary.credits.cast}</h5>
        <DataTable columns={columns(dictionary, language)} data={data.cast} />
      </>
    ),
  }

  return (
    <div className="space-y-8" data-testid="credits">
      <section className="space-y-2">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant={castLayout === 'grid' ? 'default' : 'outline'}
                  onClick={() => setCastLayout('grid')}
                >
                  <Grid size={18} />
                </Button>
              </TooltipTrigger>

              <TooltipContent>{dictionary.grid_or_table_layout.grid_layout_tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant={castLayout === 'table' ? 'default' : 'outline'}
                  onClick={() => setCastLayout('table')}
                >
                  <LucideTable size={18} />
                </Button>
              </TooltipTrigger>

              <TooltipContent>{dictionary.grid_or_table_layout.table_layout_tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {castContentByLayout[castLayout]}
      </section>

      <section className="space-y-2">
        <div className="flex space-x-2">
         {/* TODO: create a component for toggle grid or table layout */} 
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant={crewLayout === 'grid' ? 'default' : 'outline'}
                  onClick={() => setCrewLayout('grid')}
                >
                  <Grid size={18} />
                </Button>
              </TooltipTrigger>

              <TooltipContent>{dictionary.grid_or_table_layout.grid_layout_tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant={crewLayout === 'table' ? 'default' : 'outline'}
                  onClick={() => setCrewLayout('table')}
                >
                  <LucideTable size={18} />
                </Button>
              </TooltipTrigger>

              <TooltipContent>{dictionary.grid_or_table_layout.table_layout_tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {crewContentByLayout[crewLayout]}
      </section>
    </div>
  )
}
