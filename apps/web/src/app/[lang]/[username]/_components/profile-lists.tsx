'use client'

import Link from 'next/link'

import { ListCard, ListCardSkeleton } from '@/components/list-card'
import { ListForm } from '../../lists/_components/list-form'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useGetLists } from '@/api/list'

type ProfileListsProps = {
  userId: string
}

export const ProfileLists = ({ userId }: ProfileListsProps) => {
  const { user } = useSession()
  const { dictionary, language } = useLanguage()
  const { data, isLoading } = useGetLists({ limit: 99, userId })

  if (!data?.lists || isLoading)
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    )

  const isOwner = user?.id === userId
  const isPro = user?.subscriptionType === 'PRO'
  const isVisitorAndListEmpty = data.lists.length === 0 && !isOwner

  if (isVisitorAndListEmpty) {
    return (
      <div className="justify flex w-full flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>{dictionary.profile.no_lists}</p>
        <Link href={`/lists`} className="text-sm text-muted-foreground">
          {dictionary.profile.explore_popular_lists}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {data.lists.map((list) => (
        <ListCard list={list} key={list.id} />
      ))}

      {isOwner && isPro && (
        <ListForm
          trigger={
            <button className="aspect-video text-sm rounded-md border border-dashed text-muted-foreground">
              {dictionary.list_form.create_new_list}
            </button>
          }
        />
      )}

      {isOwner && !isPro && (
        <Link
          href={`/${language}/pricing`}
          className="flex items-center justify-center aspect-video text-sm rounded-md border border-dashed text-muted-foreground"
        >
          {dictionary.list_form.create_new_list}
        </Link>
      )}
    </div>
  )
}
