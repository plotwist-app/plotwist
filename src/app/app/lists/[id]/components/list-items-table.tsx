import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LISTS_QUERY_CLIENT,
  LISTS_QUERY_KEY,
  useLists,
} from '@/context/lists/lists'
import { ListItem, ListItemStatus } from '@/types/lists'
import { format } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Status } from './status'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

type ListItemsProps = {
  listItems: ListItem[]
}

export const ListItemsTable = ({ listItems }: ListItemsProps) => {
  const { handleChangeListItemStatus, handleRemoveToList } = useLists()

  const handleRemove = useCallback(
    async (id: number, listId: number) => {
      await handleRemoveToList.mutateAsync(id, {
        onSuccess: () => {
          LISTS_QUERY_CLIENT.invalidateQueries({
            queryKey: [listId],
          })

          toast.success(`Removed successfully.`)
        },
      })
    },
    [handleRemoveToList],
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[1ch]"></TableHead>
          <TableHead className="w-[200px]">Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="w-[400px]">Overview</TableHead>
          <TableHead>Added at</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {listItems.map((item, index) => (
          <TableRow key={item.id}>
            <TableCell className="font-bold text-muted-foreground">
              {index + 1}.
            </TableCell>

            <TableCell className="w-[200px] font-medium">
              <Link
                href={`/app/${
                  item.media_type === 'tv_show' ? 'tv-shows' : 'movies'
                }/${item.tmdb_id}`}
                className="underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
            </TableCell>

            <TableCell>
              <Badge variant="outline">
                {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
              </Badge>
            </TableCell>

            <TableCell>
              <p className="line-clamp-2  text-xs text-muted-foreground">
                {item.overview}
              </p>
            </TableCell>

            <TableCell className="text-xs">
              {format(new Date(item.created_at), 'PPP')}
            </TableCell>

            <TableCell>
              <Status status={item.status} />
            </TableCell>

            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>

                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={item.status}
                        onValueChange={async (status) => {
                          await handleChangeListItemStatus.mutateAsync(
                            {
                              listItemId: item.id,
                              newStatus: status as ListItemStatus,
                            },
                            {
                              onSuccess: () => {
                                LISTS_QUERY_CLIENT.invalidateQueries({
                                  queryKey: [item.list_id],
                                })
                              },
                            },
                          )
                        }}
                      >
                        {['PENDING', 'WATCHING', 'WATCHED'].map((status) => (
                          <DropdownMenuRadioItem
                            key={status}
                            value={status}
                            className="text-sm capitalize"
                          >
                            {status.toLowerCase()}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => handleRemove(item.id, item.list_id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
