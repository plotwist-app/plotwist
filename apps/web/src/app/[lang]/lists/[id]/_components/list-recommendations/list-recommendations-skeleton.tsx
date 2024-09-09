import { ProBadge } from '@/components/pro-badge'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

export const ListRecommendationsSkeleton = () => {
  return (
    <div className="col-span-1 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md flex items-center gap-1 font-semibold">
            <Skeleton className="h-[2ex] w-[10ch]" />

            <div>
              <ProBadge />
            </div>
          </h2>

          <Skeleton className="aspect-square h-6" />
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-[2ex] w-[5ch]" />
            <Skeleton className="h-[2ex] w-[5ch]" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="aspect-poster w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
