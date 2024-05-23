'use client'

import { ListCard, ListCardSkeleton } from '@/components/list-card'
import { useAuth } from '@/context/auth'
import { useQuery } from '@tanstack/react-query'
import { ListForm } from '../../lists/_components/list-form'
import { useLanguage } from '@/context/language'
import { fetchListsService } from '@/services/api/lists/fetch-lists'
import Link from 'next/link'

type ProfileListsProps = {
  userId: string
}

export const ProfileLists = ({ userId }: ProfileListsProps) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()

  const { data: lists, isLoading } = useQuery({
    queryKey: ['lists', userId],
    queryFn: async () => fetchListsService(userId),
  })

  if (!lists || isLoading)
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    )

  const isOwner = user?.id === userId

  const isVisitorAndListEmpty = lists.length === 0 && !isOwner

  if (isVisitorAndListEmpty) {
    return (
      <div className="justify flex w-full  flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>{dictionary.profile.no_lists}</p>
        <Link href={`/lists`} className="text-sm text-muted-foreground">
          {dictionary.profile.explore_popular_lists}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {lists.map((list) => (
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
