import { Button } from '@plotwist/ui/components/ui/button'
import { UserItemsList } from './user-items-list'

export type UserItemsProps = { status: 'WATCHLIST' | 'WATCHING' | 'WATCHED' }

export function UserItems({ status }: UserItemsProps) {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-3 md:grid-cols-5 gap-2">
        <UserItemsList status={status} />
      </section>

      <div className="justify-between hidden">
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
