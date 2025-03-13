'use client'

import { useLanguage } from '@/context/language'
import type { UserItemStatus } from '@/types/user-item'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Check, Clock, List, Loader, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { UserItems } from '../_components/user-items'
import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'
import { useState } from 'react'
import { useLayoutContext } from '../_context'
import { CollectionFilters } from '@/components/collection-filters/collection-filters'

export default function CollectionPage() {
  const { dictionary } = useLanguage()
  const [statusQueryState, setStatusQueryState] = useQueryState('status', {
    defaultValue: 'ALL',
  })

  const { userId } = useLayoutContext()

  const [filters, setFilters] = useState<CollectionFiltersFormValues>({
    status: statusQueryState as UserItemStatus,
    userId,
    rating: [0, 5],
    mediaType: ['TV_SHOW', 'MOVIE'],
    orderBy: 'addedAt.desc',
    onlyItemsWithoutReview: false,
  })

  const options = [
    {
      status: 'ALL',
      icon: List,
      label: dictionary.all,
    },
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

  function handleChangeStatus(status: string) {
    setStatusQueryState(status)
    setFilters(prev => ({ ...prev, status: status as UserItemStatus }))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <CollectionFilters
          status={statusQueryState as UserItemStatus}
          filters={filters}
          setFilters={newFilters => {
            setFilters({
              ...newFilters,
              status: statusQueryState as UserItemStatus,
            })
          }}
        />

        {options.map(({ status, label, icon: Icon }) => (
          <Badge
            className="cursor-pointer whitespace-nowrap"
            key={status}
            variant={status === statusQueryState ? 'default' : 'outline'}
            onClick={() => handleChangeStatus(status)}
          >
            <Icon size={12} className="mr-1" />
            {label}
          </Badge>
        ))}
      </div>

      <UserItems filters={filters} />
    </div>
  )
}
