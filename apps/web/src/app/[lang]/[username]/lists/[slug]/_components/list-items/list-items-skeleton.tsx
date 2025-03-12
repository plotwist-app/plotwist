import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { v4 } from 'uuid'

export function ListItemsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={v4()} className="aspect-poster" />
        ))}
      </div>
    </section>
  )
}
