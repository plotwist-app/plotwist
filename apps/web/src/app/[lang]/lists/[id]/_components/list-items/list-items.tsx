'use client'

import { ListItem } from '@/types/supabase/lists'
import { Grid, List } from 'lucide-react'

import { useLanguage } from '@/context/language'
import { Button } from '@/components/ui/button'

import { ListItemsGrid } from './list-items-grid'
import { DataTable, columns } from '../data-table'
import { useListMode } from '@/context/list-mode'
import { useState } from 'react'

type ListItemsProps = {
  listItems: ListItem[]
}
export const ListItems = ({ listItems }: ListItemsProps) => {
  const [layout, setLayout] = useState<'table' | 'grid'>('grid')
  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()

  const contentByLayout: Record<typeof layout, JSX.Element> = {
    grid: <ListItemsGrid listItems={listItems} />,
    table: (
      <DataTable
        data={listItems}
        columns={columns(dictionary, language, mode)}
      />
    ),
  }

  return (
    <section className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={layout === 'grid' ? 'default' : 'outline'}
          onClick={() => setLayout('grid')}
          size="icon"
          className="h-9 w-9"
        >
          <Grid className="h-4 w-4" />
        </Button>

        <Button
          variant={layout === 'table' ? 'default' : 'outline'}
          onClick={() => setLayout('table')}
          size="icon"
          className="h-9 w-9"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {contentByLayout[layout]}
    </section>
  )
}
