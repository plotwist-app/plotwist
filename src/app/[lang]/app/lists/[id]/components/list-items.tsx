'use client'

import { ListItem } from '@/types/supabase/lists'
import { Grid, Table } from 'lucide-react'
import { useState } from 'react'

import { useLanguage } from '@/context/language'
import { Button } from '@/components/ui/button'

import { ListItemsGrid } from './list-items-grid'
import { DataTable } from './data-table'
import { columns } from './data-table-columns'

type ListItemsProps = {
  listItems: ListItem[]
}

export const ListItems = ({ listItems }: ListItemsProps) => {
  const [layout, setLayout] = useState<'table' | 'grid'>('table')
  const { dictionary, language } = useLanguage()

  const contentByLayout: Record<typeof layout, JSX.Element> = {
    table: (
      <DataTable data={listItems} columns={columns(dictionary, language)} />
    ),
    grid: <ListItemsGrid listItems={listItems} />,
  }

  return (
    <section className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={layout === 'table' ? 'default' : 'outline'}
          onClick={() => setLayout('table')}
        >
          <Table className="mr-2 h-4 w-4" />
          {dictionary.list_items.table}
        </Button>

        <Button
          variant={layout === 'grid' ? 'default' : 'outline'}
          onClick={() => setLayout('grid')}
        >
          <Grid className="mr-2 h-4 w-4" />
          {dictionary.list_items.grid}
        </Button>
      </div>

      {contentByLayout[layout]}
    </section>
  )
}
