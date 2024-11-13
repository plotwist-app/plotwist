'use client'

import { PopularListCard, PopularListCardSkeleton } from './popular-list-card'
import { useLanguage } from '@/context/language'
import { useMemo } from 'react'
import { useGetLists } from '@/api/list'

export const LatestLists = () => {
  const { dictionary } = useLanguage()
  const { data, isLoading } = useGetLists()

  const content = useMemo(() => {
    if (isLoading)
      return (
        <li className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <PopularListCardSkeleton key={index} />
          ))}
        </li>
      )

    if (!data?.lists.length) {
      return (
        <div className="w-full h-[300px] flex items-center justify-center border border-dashed rounded-sm">
          {dictionary.no_lists_found}
        </div>
      )
    }

    return (
      <li className="flex flex-col gap-6">
        {data.lists.map((list) => (
          <PopularListCard list={list} key={list.id} />
        ))}
      </li>
    )
  }, [data, isLoading, dictionary])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{dictionary.latest_lists}</h2>
      </div>

      {content}
    </div>
  )
}
