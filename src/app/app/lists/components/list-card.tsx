import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { LISTS_QUERY_KEY, useLists } from '@/context/lists/lists'
import { List } from '@/types/supabase/lists'
import { tmdbImage } from '@/utils/tmdb/image'
import { MoreVertical, Trash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { toast } from 'sonner'

type ListCardProps = { list: List }

export const ListCard = ({ list }: ListCardProps) => {
  const { handleDeleteList } = useLists()

  const firstBackdropPath = list.cover_path ?? list.list_items[0]?.backdrop_path
  const thumbnail = tmdbImage(firstBackdropPath)

  return (
    <Link href={`/app/lists/${list.id}`} className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow">
        {firstBackdropPath && (
          <Image
            fill
            className="object-cover"
            src={thumbnail}
            alt={list.name}
            sizes="100%"
          />
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between gap-1">
          <span>{list.name}</span>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon" className="h-6 w-6">
                <MoreVertical size={12} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()

                  handleDeleteList.mutate(list.id, {
                    onSuccess: () => {
                      APP_QUERY_CLIENT.invalidateQueries({
                        queryKey: LISTS_QUERY_KEY,
                      })

                      toast.success('List deleted successfully.')
                    },
                    onError: (error) => {
                      toast.error(error.message)
                    },
                  })
                }}
              >
                <Trash size={12} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">
          {list.description}
        </p>
      </div>
    </Link>
  )
}
