import { Button } from '@plotwist/ui/components/ui/button'
import { Items } from './_items'

export default function WatchListPage() {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-5 gap-2">
        <Items />
      </section>

      <div className="flex justify-between">
        <Button size="sm" variant="outline">
          Newest
        </Button>

        <Button size="sm" variant="outline">
          Oldest
        </Button>
      </div>
    </div>
  )
}
