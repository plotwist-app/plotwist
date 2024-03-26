'use client'

import { tmdb } from '@/services/tmdb'
import { DataTable } from './data-table'
import { columns } from './data-table/data-table-columns'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/language'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  Grid,
  Table as LucideTable,
} from 'lucide-react'
import { useState } from 'react'
import {
  PersonCreditsMovieCard,
  PersonCreditsMovieCardSkeleton,
} from './person-credits-movie-card'
import { Credit } from '@/services/tmdb/requests/person/combined-credits'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

type PersonCreditsProps = { personId: number }
type Layout = 'grid' | 'table'

const PersonCreditsSkeleton = () => (
  <div className="flex flex-col items-center gap-4">
    <Skeleton className="h-[4ex] w-[8ch] self-start" />
    <Skeleton className="h-[2ex] w-[8ch] self-start" />
    <div className="mt-2 grid w-full grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <PersonCreditsMovieCardSkeleton key={item} />
      ))}
    </div>
  </div>
)

export const PersonCredits = ({ personId }: PersonCreditsProps) => {
  const [castLayout, setCastLayout] = useState<Layout>('grid')
  const [crewLayout, setCrewLayout] = useState<Layout>('table')
  const [isListExpanded, setIsListExpanded] = useState(false)
  const { dictionary, language } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: [personId],
    queryFn: () => tmdb.person.combinedCredits(personId, language),
  })

  if (isLoading) return <PersonCreditsSkeleton />
  if (!data) return <></>

  const renderContentByLayout = ({
    layout,
    list,
  }: {
    layout: Layout
    list: Credit[]
  }) => {
    return layout === 'grid' ? (
      <div className="flex flex-col items-end gap-4">
        <div className="mt-2 grid w-full grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
          {list
            .slice(0, isListExpanded ? list.length : 6)
            .map((item: Credit) => (
              <>
                <PersonCreditsMovieCard credit={item} key={item.id} />
              </>
            ))}
        </div>
        {isListExpanded && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsListExpanded(false)}
          >
            {dictionary.person_page.credit_list.show_less}

            <ChevronUp className="ml-1" size={12} />
          </Button>
        )}
        {!isListExpanded && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsListExpanded(true)}
          >
            {dictionary.person_page.credit_list.show_all}

            <ChevronDown className="ml-1" size={12} />
          </Button>
        )}
      </div>
    ) : (
      <>
        <DataTable columns={columns(dictionary, language)} data={list} />
      </>
    )
  }

  return (
    <div className="space-y-8" data-testid="credits">
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-bold">{dictionary.credits.cast}</h5>

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

                <TooltipContent>
                  {dictionary.grid_or_table_layout.grid_layout_tooltip}
                </TooltipContent>
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

                <TooltipContent>
                  {dictionary.grid_or_table_layout.table_layout_tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {renderContentByLayout({
          layout: castLayout,
          list: data.cast,
        })}
      </section>

      <Separator />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>
          <div className="flex space-x-2">
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

                <TooltipContent>
                  {dictionary.grid_or_table_layout.grid_layout_tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    className="h-8-w-8"
                    size="icon"
                    variant={crewLayout === 'table' ? 'default' : 'outline'}
                    onClick={() => setCrewLayout('table')}
                  >
                    <LucideTable size={18} />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  {dictionary.grid_or_table_layout.table_layout_tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {renderContentByLayout({
          layout: crewLayout,
          list: data.crew,
        })}
      </section>
    </div>
  )
}
