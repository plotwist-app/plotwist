'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { UserItems } from '../_components/user-items'
import { useQueryState } from 'nuqs'
import type { UserItemStatus } from '@/types/user-item'
import { Check, Clock, List, Loader, Trash } from 'lucide-react'
import { useLanguage } from '@/context/language'
import { CollectionFilters } from '@/components/collection-filters/collection-filters'
import { useState } from 'react'
import { useLayoutContext } from '../_context'
import type { CollectionFiltersFormValues } from '@/components/collection-filters/collection-filters-schema'

export default function CollectionPage() {
  const { dictionary } = useLanguage()
  const [statusQueryState, setStatusQueryState] = useQueryState('status', {
    defaultValue: 'ALL',
  })

  const { userId } = useLayoutContext()
  const defaultValues: CollectionFiltersFormValues = {
    status: statusQueryState as UserItemStatus,
    userId,
    rating: [0, 5],
    mediaType: ['TV_SHOW', 'MOVIE'],
    orderBy: 'addedAt.desc',
  }

  const [filters, setFilters] =
    useState<CollectionFiltersFormValues>(defaultValues)

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

  return (
    <div className="space-y-2">
      <div className="flex gap-1 md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <CollectionFilters
          status={statusQueryState as UserItemStatus}
          filters={filters}
          setFilters={setFilters}
        />

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

      <UserItems filters={filters} />
    </div>
  )
}
