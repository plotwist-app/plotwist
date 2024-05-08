'use client'

import { fetchPopularLists } from '@/services/api/lists/fetch-popular-lists'
import { useQuery } from '@tanstack/react-query'
import { PopularListCard } from './popular-list-card'

export const PopularLists = () => {
  const { data } = useQuery({
    queryKey: ['popular-lists'],
    queryFn: fetchPopularLists,
  })

  if (!data) return <></>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Popular lists</h2>

      <li className="flex flex-col gap-6">
        {data.map((list) => (
          <PopularListCard list={list} key={list.id} />
        ))}
      </li>
    </div>
  )
}
