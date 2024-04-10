'use client'

import { ListCard, ListCardSkeleton } from '@/components/list-card'
import { useAuth } from '@/context/auth'
import { useQuery } from '@tanstack/react-query'
import { ListForm } from '../../lists/_components/list-form'
import { useLanguage } from '@/context/language'
import { fetchListsService } from '@/services/api/lists'

type ProfileListsProps = {
  userId: string
}

export const ProfileLists = ({ userId }: ProfileListsProps) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['lists', userId],
    queryFn: async () => fetchListsService(userId),
  })

  if (!data || isLoading)
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    )

  const isOwner = user?.id === userId

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.map((list) => (
        <ListCard list={list} key={list.id} />
      ))}

      {isOwner && (
        <ListForm
          trigger={
            <ListForm
              trigger={
                <button className="aspect-video rounded-md border border-dashed">
                  {dictionary.list_form.create_new_list}
                </button>
              }
            />
          }
        />
      )}
    </div>
  )
}
