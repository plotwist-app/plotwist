import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { DataTableSkeleton } from './data-table'
import { ListRecommendationsSkeleton } from './list-recommendations/list-recommendations-skeleton'

type ListPageSkeletonProps = {
  mode: 'EDIT' | 'SHOW'
}

export const ListPageSkeleton = ({ mode }: ListPageSkeletonProps) => {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 lg:px-0">
      <div className="h-[30dvh] w-full overflow-hidden rounded-lg lg:h-[55dvh]">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 gap-y-8 p-4 lg:grid-cols-3 lg:gap-x-16 lg:p-0">
        <div
          className={cn(
            'space-y-4',
            mode === 'EDIT' ? 'col-span-2' : 'col-span-3',
          )}
        >
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between">
              <div className="flex items-start gap-2">
                <Skeleton className="mb-2 h-8 w-[20ch]" />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  by
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-[2ex] w-[11ch]" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          <DataTableSkeleton />
        </div>

        <div className="col-span-1 space-y-4">
          {mode === 'EDIT' && <ListRecommendationsSkeleton />}
        </div>
      </div>
    </div>
  )
}
