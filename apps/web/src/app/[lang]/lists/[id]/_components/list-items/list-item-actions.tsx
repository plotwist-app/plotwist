'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { ExternalLink, MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useLists } from '@/context/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'

import { listPageQueryKey } from '@/utils/list'

import { List, ListItem, ListItemStatus } from '@/types/supabase/lists'
import { useListItem } from '@/hooks/use-list-item'
import { useListMode } from '@/context/list-mode'
import Link from 'next/link'

type ListItemActionsProps = {
  listItem: ListItem
  openDropdown?: boolean
  setOpenDropdown?: (state: boolean) => void
}

export const ListItemActions = ({
  listItem,
  openDropdown,
  setOpenDropdown,
}: ListItemActionsProps) => {
  const { handleChangeListCoverPath } = useLists()
  const { handleDelete, handleUpdateStatus } = useListItem(listItem)

  const { user } = useAuth()
  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()

  const handleChangeBackdrop = useCallback(async () => {
    if (!user) return

    const variables = {
      listId: listItem.list_id,
      newCoverPath: listItem.backdrop_path,
    }

    await handleChangeListCoverPath.mutateAsync(variables, {
      onSuccess: () => {
        APP_QUERY_CLIENT.setQueryData(
          listPageQueryKey(listItem.list_id),
          (query: { data: List }) => {
            const newQuery = {
              ...query,
              data: {
                ...query.data,
                cover_path: variables.newCoverPath,
              },
            }

            return newQuery
          },
        )

        APP_QUERY_CLIENT.setQueryData(['lists', user.id], (query: List[]) => {
          const newData = query.map((list) => {
            if (list.id === variables.listId) {
              return {
                ...list,
                cover_path: variables.newCoverPath,
              }
            }

            return list
          })

          return newData
        })

        toast.success(dictionary.list_item_actions.cover_changed_successfully)
      },
    })
  }, [dictionary, handleChangeListCoverPath, listItem, user])

  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary" className="h-6 w-6">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {mode === 'EDIT' ? (
          <>
            <DropdownMenuItem onClick={() => handleChangeBackdrop()}>
              {dictionary.list_item_actions.use_as_cover}
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {dictionary.list_item_actions.status}
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={listItem.status}
                  onValueChange={(status) =>
                    handleUpdateStatus.mutate(status as ListItemStatus)
                  }
                >
                  {['PENDING', 'WATCHING', 'WATCHED'].map((status) => (
                    <DropdownMenuRadioItem
                      key={status}
                      value={status}
                      className="text-sm capitalize"
                    >
                      {
                        dictionary.statuses[
                          status.toLowerCase() as
                            | 'pending'
                            | 'watching'
                            | 'watched'
                        ]
                      }
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleDelete.mutate()}>
                {dictionary.list_item_actions.delete}
              </DropdownMenuItem>
            </DropdownMenuSub>
          </>
        ) : (
          <DropdownMenuItem>
            <Link
              href={`/${language}/${listItem.media_type === 'MOVIE' ? 'movies' : 'tv-series'}/${listItem.tmdb_id}`}
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} />
              {dictionary.list_item_actions.see_details}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
