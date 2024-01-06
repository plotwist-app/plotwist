'use client'

import { useLists } from '@/context/lists/lists'
import { ListCard } from './list-card'
import { CreateNewListForm } from './create-new-list-form'

export const Lists = () => {
  const { lists, userId } = useLists()

  return (
    <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}

      {lists.length < 3 && <CreateNewListForm userId={userId} />}
    </div>
  )
}
