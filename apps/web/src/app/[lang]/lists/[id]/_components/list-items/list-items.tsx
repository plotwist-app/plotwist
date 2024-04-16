'use client'

import { ListItem } from '@/types/supabase/lists'
import { Grid, List } from 'lucide-react'
import { useState } from 'react'

import { useLanguage } from '@/context/language'
import { Button } from '@/components/ui/button'

import { ListItemsGrid } from './list-items-grid'
import { DataTable, columns } from '../data-table'
import { useListMode } from '@/context/list-mode'

type ListItemsProps = {
  listItems: ListItem[]
}

export const ListItems = ({ listItems }: ListItemsProps) => {
  const [layout, setLayout] = useState<'table' | 'grid'>('table')
  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()

  const contentByLayout: Record<typeof layout, JSX.Element> = {
    table: (
      <DataTable
        data={listItems}
        columns={columns(dictionary, language, mode)}
      />
    ),
    grid: <ListItemsGrid listItems={listItems} />,
  }

  return (
    <section className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={layout === 'table' ? 'default' : 'outline'}
          onClick={() => setLayout('table')}
          size="icon"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant={layout === 'grid' ? 'default' : 'outline'}
          onClick={() => setLayout('grid')}
          size="icon"
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>

      {contentByLayout[layout]}
    </section>
  )
}
