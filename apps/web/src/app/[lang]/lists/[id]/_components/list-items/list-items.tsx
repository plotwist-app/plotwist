'use client'

import { ListItem } from '@/types/supabase/lists'
import { Grid, List } from 'lucide-react'

import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'

import { ListItemsGrid } from './list-items-grid'
import { DataTable, columns } from '../data-table'
import { useListMode } from '@/context/list-mode'
import { useState } from 'react'
import { useSession } from '@/context/session'

type ListItemsProps = {
  ownerId: string
  listItems: ListItem[]
}
export const ListItems = ({ ownerId, listItems }: ListItemsProps) => {
  const [layout, setLayout] = useState<'table' | 'grid'>('grid')
  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()
  const [isEditable, setIsEditable] = useState(false)

  const { user } = useSession()

  const isListAuthor = ownerId === user?.id

  const contentByLayout: Record<typeof layout, JSX.Element> = {
    grid: (
      <ListItemsGrid
        listItems={listItems}
        isEditable={!isListAuthor ? false : isEditable}
      />
    ),
    table: (
      <DataTable
        data={listItems}
        columns={columns(dictionary, language, mode)}
      />
    ),
  }

  return (
    <section className="space-y-4">
      <div className="flex justify-between">
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
        {layout === 'grid' && (
          <Button
            variant="outline"
            onClick={() => setIsEditable(!isEditable)}
            disabled={!isListAuthor}
          >
            {isEditable ? dictionary.save_order : dictionary.edit_order}
          </Button>
        )}
      </div>
      {contentByLayout[layout]}
    </section>
  )
}
