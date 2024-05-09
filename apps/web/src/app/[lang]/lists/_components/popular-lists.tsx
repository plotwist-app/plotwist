'use client'

import { fetchPopularLists } from '@/services/api/lists/fetch-popular-lists'
import { useQuery } from '@tanstack/react-query'
import { PopularListCard } from './popular-list-card'
import { Badge } from '@/components/ui/badge'

export const PopularLists = () => {
  const { data } = useQuery({
    queryKey: ['popular-lists'],
    queryFn: fetchPopularLists,
  })

  if (!data) return <></>

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Popular lists</h2>

        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-not-allowed opacity-50">
            Last Week
          </Badge>

          <Badge variant="outline" className="cursor-not-allowed opacity-50">
            Last Month
          </Badge>

          <Badge>All time</Badge>
        </div>
      </div>

      <li className="flex flex-col gap-6">
        {data.map((list) => (
          <PopularListCard list={list} key={list.id} />
        ))}
      </li>
    </div>
  )
}
