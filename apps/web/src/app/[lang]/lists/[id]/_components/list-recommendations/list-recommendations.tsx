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

type ListRecommendationsProps = { list: List }
export const ListRecommendations = ({ list }: ListRecommendationsProps) => {
  const { language } = useLanguage()
  const { user } = useAuth()

  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: ['list-recommendations', list],
    queryFn: async () => await listRecommendations(list.id, language),
    refetchOnWindowFocus: false,
  })

  const content = useMemo(() => {
    console.log({ user })
    if (user?.subscription_type !== 'PRO') {
      return (
        <div className="relative grid grid-cols-3 gap-2">
          <div className="absolute h-full w-full rounded-lg border border-dashed"></div>

          <div className="aspect-poster w-full" />
        </div>
      )
    }

    if (isLoading || !data || isFetching)
      return (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="aspect-poster w-full" />
          <Skeleton className="aspect-poster w-full" />
          <Skeleton className="aspect-poster w-full" />
        </div>
      )

    return (
      <div className="grid grid-cols-3 gap-2">
        {data.movies.map((movie) => (
          <ListRecommendation movie={movie} key={movie.id} list={list} />
        ))}
      </div>
    )
  }, [isLoading, data, isFetching, list, user])

  return (
    <div className="col-span-1 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md font-semibold">
            Suggestions
            <span className="ml-1 animate-shine rounded-full border bg-[linear-gradient(110deg,#ffffff,45%,#f1f1f1,55%,#ffffff)] bg-[length:200%_100%] px-2 py-0.5 text-[10px] dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]">
              PRO
            </span>
          </h2>

          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => refetch()}
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
