'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/context/language'
import { listRecommendations } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import { RotateCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ListRecommendation } from './list-recommendation'
import { List } from '@/types/supabase/lists'
import { useAuth } from '@/context/auth'
import { ProBadge } from '@/components/pro-badge'
import { ListRecommendationsBlock } from './list-recommendations-block'

type ListRecommendationsProps = { list: List }
export const ListRecommendations = ({ list }: ListRecommendationsProps) => {
  const { language, dictionary } = useLanguage()
  const { user } = useAuth()

  const [type, setType] = useState<'movies' | 'tv'>('movies')
  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: ['list-recommendations', list.id],
    queryFn: async () => await listRecommendations(list.id, language),
    refetchOnWindowFocus: false,
  })

  const userHasPermission = user?.subscription_type === 'PRO'

  const content = useMemo(() => {
    if (isLoading || !data || isFetching)
      return (
        <div className="relative grid grid-cols-3 gap-2">
          {!userHasPermission && <ListRecommendationsBlock />}

          <Skeleton className="aspect-poster w-full" />
          <Skeleton className="aspect-poster w-full" />
          <Skeleton className="aspect-poster w-full" />
        </div>
      )

    if (!userHasPermission) {
      return (
        <div className="relative select-none">
          <ListRecommendationsBlock />

          <div className="pointer-events-none grid grid-cols-3 gap-2">
            {data[type].map((item) => (
              <ListRecommendation item={item} key={item.id} list={list} />
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {data[type].map((item) => (
          <ListRecommendation item={item} key={item.id} list={list} />
        ))}
      </div>
    )
  }, [isLoading, data, isFetching, userHasPermission, type, list])

  return (
    <div className="col-span-1 space-y-8 border-t p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md flex gap-1 font-semibold">
            {dictionary.list_recommendations.title}

            <div>
              <ProBadge />
            </div>
          </h2>

          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => refetch()}
            disabled={!userHasPermission}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Badge
              className="cursor-pointer"
              onClick={() => setType('movies')}
              variant={type === 'movies' ? 'default' : 'outline'}
            >
              {dictionary.list_recommendations.movies}
            </Badge>

            <Badge
              className="cursor-pointer"
              variant={type === 'tv' ? 'default' : 'outline'}
              onClick={() => setType('tv')}
            >
              {dictionary.list_recommendations.series}
            </Badge>
          </div>

          {content}
        </div>
      </div>
    </div>
  )
}
