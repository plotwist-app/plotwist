'use client'

import { useState } from 'react'

import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'

import { ListItemsGrid } from './list-items-grid'
import { useSession } from '@/context/session'
import { useGetListItemsByListIdSuspense } from '@/api/list-item'

type ListItemsProps = {
  ownerId: string
  listId: string
}

export const ListItems = ({ ownerId, listId }: ListItemsProps) => {
  const [isEditable, setIsEditable] = useState(false)

  const { dictionary } = useLanguage()
  const { user } = useSession()
  const {
    data: { listItems },
  } = useGetListItemsByListIdSuspense(listId)

  const isListAuthor = ownerId === user?.id

  return (
    <section className="space-y-4">
      {isListAuthor && (
        <Button
          variant="outline"
          onClick={() => setIsEditable(!isEditable)}
          disabled={true}
        >
          {isEditable ? dictionary.save_order : dictionary.edit_order}
        </Button>
      )}

      <ListItemsGrid
        listItems={listItems}
        isEditable={isListAuthor ? isEditable : false}
      />
    </section>
  )
}
