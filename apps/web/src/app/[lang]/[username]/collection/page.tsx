'use client'

import { useLanguage } from '@/context/language'
import type { UserItemStatus } from '@/types/user-item'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Check, Clock, Loader, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { UserItems } from '../_components/user-items'

export default function CollectionPage() {
  const { dictionary } = useLanguage()
  const [statusQueryState, setStatusQueryState] = useQueryState('status', {
    defaultValue: 'WATCHED',
  })

  const options = [
    {
      status: 'WATCHED',
      icon: Check,
      label: dictionary.watched,
    },
    {
      status: 'WATCHING',
      icon: Loader,
      label: dictionary.watching,
    },
    {
      status: 'WATCHLIST',
      icon: Clock,
      label: dictionary.watchlist,
    },
    {
      status: 'DROPPED',
      icon: Trash,
      label: dictionary.dropped,
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex gap-1 md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        {options.map(({ status, label, icon: Icon }) => (
          <Badge
            className="cursor-pointer whitespace-nowrap"
            key={status}
            variant={status === statusQueryState ? 'default' : 'outline'}
            onClick={() => setStatusQueryState(status)}
          >
            <Icon size={12} className="mr-1" />
            {label}
          </Badge>
        ))}
      </div>

      <UserItems status={statusQueryState as UserItemStatus} />
    </div>
  )
}
