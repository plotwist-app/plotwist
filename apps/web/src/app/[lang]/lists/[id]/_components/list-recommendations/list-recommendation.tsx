'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ExternalLink, MoreVertical, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useLists } from '@/context/lists'

import { cn } from '@/lib/utils'
import { List } from '@/types/supabase/lists'
import { Movie, TvSerie } from '@plotwist/tmdb'

import { listPageQueryKey } from '@/utils/list'
import { tmdbImage } from '@/utils/tmdb/image'
import { sanitizeListItem } from '@/utils/tmdb/list/list_item'

type ListRecommendationProps = {
  item: Movie | TvSerie
  list: List
}

export const ListRecommendation = ({ item, list }: ListRecommendationProps) => {
  const { language, dictionary } = useLanguage()
  const { handleAddToList } = useLists()
  const [openDropdown, setOpenDropdown] = useState(false)

  const handleAdd = useCallback(async () => {
    const sanitizedItem = sanitizeListItem(list.id, item)

    handleAddToList.mutate(
      { item: sanitizedItem },
      {
        onSettled: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: listPageQueryKey(list.id),
          })

          toast.success(dictionary.list_recommendations.added_successfully)
        },
      },
    )
  }, [handleAddToList, list, item, dictionary])

  const includesInList = useMemo(() => {
    return list.list_items.some((listItem) => listItem.tmdb_id === item.id)
  }, [list, item.id])

  if (includesInList) {
    return (
      <div className="aspect-poster w-full rounded-md border border-dashed" />
    )
  }

  return (
    <div className="group relative aspect-poster w-full overflow-hidden rounded-md border">
      <div
        className={cn(
          'absolute z-20 h-full w-full bg-black/80 opacity-0 transition group-hover:opacity-100',
          openDropdown && 'opacity-100',
        )}
      >
        <div className="absolute right-2 top-2">
          <DropdownMenu onOpenChange={setOpenDropdown} open={openDropdown}>
            <DropdownMenuTrigger>
              <Button size="icon" variant="default" className="h-5 w-5">
                <MoreVertical size={12} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAdd()}>
                <PlusCircle size={14} className="mr-1" />
                {dictionary.list_recommendations.add_to_list}
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/${language}/movies/${item.id}`}>
                  <ExternalLink size={14} className="mr-1" />
                  {dictionary.list_recommendations.view_details}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Image src={tmdbImage(item.poster_path)} fill alt={item.overview} />
    </div>
  )
}
