import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LISTS_QUERY_CLIENT,
  LISTS_QUERY_KEY,
  useLists,
} from '@/context/lists/lists'
import { List } from '@/types/lists'
import { MoreVertical, Trash } from 'lucide-react'
import Link from 'next/link'

import { toast } from 'sonner'

type ListCardProps = { list: List }

export const ListCard = ({ list }: ListCardProps) => {
  const { handleDeleteList } = useLists()

  return (
    <Link href={`/app/lists/${list.id}`} className="space-y-2">
      <div className="aspect-video w-full rounded-md border"></div>

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
                      LISTS_QUERY_CLIENT.invalidateQueries({
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
