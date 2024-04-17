import { Skeleton } from '@/components/ui/skeleton'
import { ListRecommendationsSkeleton } from './list-recommendations/list-recommendations-skeleton'

type ListPageSkeletonProps = {
  mode: 'EDIT' | 'SHOW'
}

export const ListPageSkeleton = ({ mode }: ListPageSkeletonProps) => {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-0 pb-4 lg:py-4">
      <div className="space-y-4">
        <div className="h-[30dvh] w-full overflow-hidden md:rounded-lg lg:h-[55dvh]">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-8 px-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
        <div className="col-span-2 space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between">
              <div className="flex items-start gap-2">
                <Skeleton className="mb-2 h-8 w-[10ch]" />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  by
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-[2ex] w-[11ch]" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="aspect-poster" />
            ))}
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          {mode === 'EDIT' && <ListRecommendationsSkeleton />}
        </div>
      </div>
    </div>
  )
}
