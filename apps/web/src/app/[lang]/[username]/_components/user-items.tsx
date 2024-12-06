import { UserItemsList } from './user-items-list'

export type UserItemsProps = { status: 'WATCHLIST' | 'WATCHING' | 'WATCHED' }

export function UserItems({ status }: UserItemsProps) {
  return (
    <section className="grid grid-cols-3 md:grid-cols-5 gap-2">
      <UserItemsList status={status} />
    </section>
  )
}
