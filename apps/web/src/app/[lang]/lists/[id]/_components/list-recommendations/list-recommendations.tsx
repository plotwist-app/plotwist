'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/context/language'
import { listRecommendations } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import { RotateCw } from 'lucide-react'
import { useMemo } from 'react'
import { ListRecommendation } from './list-recommendation'
import { List } from '@/types/supabase/lists'
import { useAuth } from '@/context/auth'
import { ProBadge } from '@/components/pro-badge'
import { ListRecommendationsBlock } from './list-recommendations-block'

type ListRecommendationsProps = { list: List }
export const ListRecommendations = ({ list }: ListRecommendationsProps) => {
  const { language } = useLanguage()
  const { user } = useAuth()

  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: ['list-recommendations', list],
    queryFn: async () => await listRecommendations(list.id, language),
    refetchOnWindowFocus: false,
  })

  const userHasPermission = user?.subscription_type === 'PRO'

  const content = useMemo(() => {
    if (isLoading || !data || isFetching)
      return (
        <div className="relative grid grid-cols-3 gap-2">
          <ListRecommendationsBlock />
          <Skeleton className="aspect-poster w-full" />
          <Skeleton className="aspect-poster w-full" />
          <Skeleton className="aspect-poster w-full" />
        </div>
      )

    if (!userHasPermission) {
      return (
        <div className="pointer-events-none relative grid grid-cols-3 gap-2">
          <ListRecommendationsBlock />
          {data.movies.map((movie) => (
            <ListRecommendation movie={movie} key={movie.id} list={list} />
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {data.movies.map((movie) => (
          <ListRecommendation movie={movie} key={movie.id} list={list} />
        ))}
      </div>
    )
  }, [userHasPermission, isLoading, data, isFetching, list])

  return (
    <div className="col-span-1 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md flex gap-1 font-semibold">
            Suggestions
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
            <Badge className="cursor-pointer">Movie</Badge>
            <Badge className="cursor-not-allowed opacity-50" variant="outline">
              Series
            </Badge>
          </div>

          {content}
        </div>
      </div>
    </div>
  )
}
