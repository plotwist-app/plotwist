'use client'

import { CreateNewListForm } from './create-new-list-form'
import { ListCard } from './list-card'
import { useLists } from '@/context/lists/lists'

type ListsContentProps = {
  userId: string
}

export const ListsContent = ({ userId }: ListsContentProps) => {
  const { lists } = useLists()

  return (
    <>
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}

      {lists.length < 3 && <CreateNewListForm userId={userId} />}
    </>
  )
}
