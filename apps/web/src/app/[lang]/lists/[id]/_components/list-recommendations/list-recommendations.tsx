'use client'

import { Poster } from '@/components/poster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listRecommendations } from '@/services/api'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import { RotateCw } from 'lucide-react'

type ListRecommendationsProps = { id: string }
export const ListRecommendations = ({ id }: ListRecommendationsProps) => {
  const { data, refetch } = useQuery({
    queryKey: ['list-recommendations', id],
    queryFn: async () => await listRecommendations(id),
  })

  if (!data) return <p>loading...</p>

  return (
    <div className="col-span-1 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            Recommendations
            <span className="animate-shine ml-1 rounded-full border bg-[linear-gradient(110deg,#ffffff,45%,#f1f1f1,55%,#ffffff)] bg-[length:200%_100%] px-2 py-0.5 text-[12px] dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]">
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

          <div className="grid grid-cols-3 gap-2">
            {data.movie.map((item) => (
              <Poster
                key={item.id}
                url={tmdbImage(item.poster_path)}
                alt={item.title}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
