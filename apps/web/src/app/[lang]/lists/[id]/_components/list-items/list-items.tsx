'use client'

import { useGetListItemsByListIdSuspense } from '@/api/list-item'
import { useLanguage } from '@/context/language'
import { ListItemsGrid } from './list-items-grid'

type ListItemsProps = {
  listId: string
}

export const ListItems = ({ listId }: ListItemsProps) => {
  const { language } = useLanguage()
  const { data } = useGetListItemsByListIdSuspense(listId, { language })

  return <ListItemsGrid listItems={data} />
}
