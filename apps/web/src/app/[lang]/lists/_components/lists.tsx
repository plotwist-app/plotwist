'use client'

import { useLists } from '@/context/lists'
import { useLanguage } from '@/context/language'

import { ListCard, ListCardSkeleton } from './list-card'
import { ListForm } from './list-form'
import { useAuth } from '@/context/auth'

import { NoAccountTooltip } from '@/components/no-account-tooltip'
import { useMemo } from 'react'

export const Lists = () => {
  const { lists, isLoading } = useLists()
  const { dictionary } = useLanguage()
  const { user } = useAuth()

  const listsAmountLimit = useMemo(() => {
    if (process.env.NODE_ENV === 'development' || user) {
      return Infinity
    }

    return 1
  }, [user])

  if (!user) {
    return (
      <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        <NoAccountTooltip>
          <button className="aspect-video cursor-not-allowed rounded-md border border-dashed opacity-50">
            {dictionary.list_form.create_new_list}
          </button>
        </NoAccountTooltip>
      </div>
    )
  }

  if (isLoading)
    return (
      <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    )

  return (
    <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}

      {lists.length < listsAmountLimit && (
        <ListForm
          trigger={
            <button className="aspect-video rounded-md border border-dashed">
              {dictionary.list_form.create_new_list}
            </button>
          }
        />
      )}
    </div>
  )
}
