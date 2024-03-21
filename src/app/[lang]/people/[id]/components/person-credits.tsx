'use client'

import { tmdb } from '@/services/tmdb'
import { DataTable } from './data-table'
import { columns } from './data-table/data-table-columns'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/language'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Grid, Table as LucideTable } from 'lucide-react'
import { MouseEventHandler, useCallback, useEffect, useState } from 'react'
import { PersonCreditsMovieCard } from './person-credits-movie-card'
import { Credit } from '@/services/tmdb/requests/person/combined-credits'

type PersonCreditsProps = { personId: number }
type Layout = 'grid' | 'table'

function useCreditsList(initialItems: Credit[] = [], initialMaxListLength: number = 6) {
  const [list, setList] = useState({
    items: initialItems,
    maxListLength: initialMaxListLength,
  });

  const updateListItems = useCallback((newItems: Credit[]) => {
    setList((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  }, []);

  const incrementMaxListLength = useCallback(() => {
    setList((prevState) => ({
      ...prevState,
      maxListLength: prevState.maxListLength + 6,
    }));
  }, []);

  return [list, updateListItems, incrementMaxListLength] as const;
}

export const PersonCredits = ({ personId }: PersonCreditsProps) => {
  const [castLayout, setCastLayout] = useState<Layout>('grid');
  const [crewLayout, setCrewLayout] = useState<Layout>('table');
  const { dictionary, language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: [personId],
    queryFn: () => tmdb.person.combinedCredits(personId, language),
  });

  const [crewsList, updateCrewsList, incrementCrewsMaxLength] = useCreditsList();
  const [castList, updateCastList, incrementCastMaxLength] = useCreditsList();

  useEffect(() => {
    if (data) {
      updateCrewsList(data.crew);
      updateCastList(data.cast);
    }
  }, [data, updateCrewsList, updateCastList]);


  // TODO: add skeleton loading but able to toggle layout
  if (isLoading) return <p>Skeleton Loading...</p>;
  if (!data) return <></>;

  // Reusable function to render the content by layout
  const renderContentByLayout = (
    {layout, list, incrementFunction, section}: {layout: Layout, list: {items: Credit[], maxListLength: number}, incrementFunction: MouseEventHandler<HTMLButtonElement> | undefined, section: 'cast' | 'crew' } 
  ) => {
    return layout === 'grid' ? (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
          {list.items.slice(0, list.maxListLength).map((item: Credit) => (
            <PersonCreditsMovieCard
              credit={item}
              key={item.id}
            />
          ))}
        </div>
        {list.items.length > list.maxListLength && (
          // TODO: add this text to dictionary
          <Button size="lg" onClick={incrementFunction}>Mostrar mais</Button>
        )}
      </div>
    ) : (
      <>
        <DataTable columns={columns(dictionary, language)} data={list.items} />
      </>
    );
  };

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

        <h5 className="text-xl font-bold">{dictionary.credits.cast}</h5>
        {renderContentByLayout({
          layout: castLayout,
          list: castList,
          incrementFunction: incrementCastMaxLength,
          section: 'cast'
        })}
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

        <h5 className="text-xl font-bold">{dictionary.credits.crew}</h5>

        {renderContentByLayout({
          layout: crewLayout,
          list: crewsList,
          incrementFunction: incrementCrewsMaxLength,
          section: 'crew'
        })}
      </section>
    </div>
  )
}
