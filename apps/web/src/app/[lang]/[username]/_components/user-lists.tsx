'use client'

import { Link } from 'next-view-transitions'

import { useGetListsSuspense } from '@/api/list'
import { ListCard } from '@/components/list-card'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { ListForm } from '../../lists/_components/list-form'
import { useLayoutContext } from '../_context'
import { Button } from '@plotwist/ui/components/ui/button'
import { Plus } from 'lucide-react'

export const UserLists = () => {
  const { user } = useSession()
  const { dictionary, language } = useLanguage()
  const { userId } = useLayoutContext()

  const { data } = useGetListsSuspense({ limit: 99, userId })

  const isOwner = user?.id === userId
  const isVisitorAndListEmpty = data.lists.length === 0 && !isOwner

  if (isVisitorAndListEmpty) {
    return (
      <div className="justify flex w-full flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>{dictionary.profile.no_lists}</p>

        <Link
          href={`/${language}/lists`}
          className="text-sm text-muted-foreground"
        >
          {dictionary.profile.explore_popular_lists}
        </Link>
      </div>
    )
  }

  return (
    <>
      {isOwner && (
        <ListForm
          trigger={
            <Button size="sm" variant="outline">
              <Plus size={12} className="mr-2" />
              {dictionary.list_form.create_new_list}
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.lists.map(list => (
          <ListCard list={list} key={list.id} />
        ))}
      </div>
    </>
  )
}
