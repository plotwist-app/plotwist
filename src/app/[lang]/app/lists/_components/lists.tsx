'use client'

import { useLists } from '@/context/lists'
import { useLanguage } from '@/context/language'

import { ListCard } from './list-card'
import { CreateNewListForm } from './create-new-list-form'

export const Lists = () => {
  const { lists } = useLists()
  const { dictionary } = useLanguage()

  return (
    <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}

      {lists.length < 1 && (
        <CreateNewListForm
          trigger={
            <button className="aspect-video rounded-md border border-dashed">
              {dictionary.create_new_list_form.create_new_list}
            </button>
          }
        />
      )}
    </div>
  )
}
