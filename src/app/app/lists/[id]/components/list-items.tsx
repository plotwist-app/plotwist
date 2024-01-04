'use client'

import { Button } from '@/components/ui/button'

import { ListItem } from '@/types/lists'
import { Grid as LucideGrid, Table as LucideTable } from 'lucide-react'
import { useState } from 'react'
import { ListItemsTable } from './list-items-table'

type ListItemsProps = {
  listItems: ListItem[]
}

export const ListItems = ({ listItems }: ListItemsProps) => {
  const [layout, setLayout] = useState<'table' | 'grid'>('table')

  const contentByLayout: Record<typeof layout, JSX.Element> = {
    grid: (
      <div>
        {listItems.map((item) => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    ),
    table: <ListItemsTable listItems={listItems} />,
  }

  return (
    <section className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={layout === 'table' ? 'default' : 'outline'}
          onClick={() => setLayout('table')}
        >
          <LucideTable className="mr-2 h-4 w-4" />
          Table
        </Button>

        <Button
          variant={layout === 'grid' ? 'default' : 'outline'}
          onClick={() => setLayout('grid')}
        >
          <LucideGrid className="mr-2 h-4 w-4" />
          Grid
        </Button>
      </div>

      {contentByLayout[layout]}
    </section>
  )
}
