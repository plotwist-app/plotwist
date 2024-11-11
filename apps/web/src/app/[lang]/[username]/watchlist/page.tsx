import { Button } from '@plotwist/ui/components/ui/button'
import { Plus } from 'lucide-react'

export default async function WatchListPage() {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-5 gap-4">
        <div className="border border-dashed aspect-poster rounded-sm flex items-center justify-center">
          <Plus />
        </div>

        {Array.from({ length: 20 }).map((_, index) => (
          <div
            className="border border-dashed aspect-poster rounded-sm"
            key={index}
          />
        ))}
      </section>

      <div className="flex justify-between">
        <Button size="sm">Newest</Button>
        <Button size="sm">Oldest</Button>
      </div>
    </div>
  )
}
