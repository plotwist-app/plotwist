'use client'

import { useState } from 'react'

import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'

import { ListItemsGrid } from './list-items-grid'
import { useSession } from '@/context/session'

type ListItemsProps = {
  ownerId: string
}

export const ListItems = ({ ownerId }: ListItemsProps) => {
  const [isEditable, setIsEditable] = useState(false)
  const { dictionary } = useLanguage()
  const { user } = useSession()

  const isListAuthor = ownerId === user?.id

  return (
    <section className="space-y-4">
      {isListAuthor && (
        <Button
          variant="outline"
          onClick={() => setIsEditable(!isEditable)}
          disabled={!isListAuthor}
        >
          {isEditable ? dictionary.save_order : dictionary.edit_order}
        </Button>
      )}

      <ListItemsGrid
        listItems={[]}
        isEditable={isListAuthor ? isEditable : false}
      />
    </section>
  )
}
