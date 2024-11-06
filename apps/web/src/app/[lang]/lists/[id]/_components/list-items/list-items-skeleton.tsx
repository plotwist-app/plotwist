import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

export function ListItemsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-poster" />
        ))}
      </div>
    </section>
  )
}
