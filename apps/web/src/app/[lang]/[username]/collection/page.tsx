'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { UserItems } from '../_components/user-items'
import { useQueryState } from 'nuqs'
import type { UserItemStatus } from '@/types/user-item'
import { Check, Clock, Loader, Trash, X } from 'lucide-react'
import { useLanguage } from '@/context/language'

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
      label: dictionary.watched,
    },
    {
      status: 'WATCHLIST',
      icon: Clock,
      label: dictionary.watched,
    },
    {
      status: 'DROPPED',
      icon: Trash,
      label: 'dropado',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {options.map(({ status, label, icon: Icon }) => (
          <Badge
            className="cursor-pointer"
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
