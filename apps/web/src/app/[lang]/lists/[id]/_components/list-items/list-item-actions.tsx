'use client'

import { useCallback } from 'react'
import { ExternalLink, Image, MoreVertical, Trash } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useListMode } from '@/context/list-mode'

import type { ListItem } from '@/types/supabase/lists'
import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
} from '@/api/list-item'
import { APP_QUERY_CLIENT } from '@/context/app'
import { toast } from 'sonner'
import { getGetListsQueryKey, usePatchListBanner } from '@/api/list'
import { useRouter } from 'next/navigation'

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
  const deleteListItem = useDeleteListItemId()
  const patchBanner = usePatchListBanner()

  const { user } = useSession()
  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()
  const { refresh } = useRouter()

  const handleChangeBackdrop = useCallback(async () => {
    if (!user) return

    await patchBanner.mutateAsync(
      {
        data: { bannerPath: listItem.backdropPath!, listId: listItem.listId },
      },
      {
        onSuccess: async () => {
          await APP_QUERY_CLIENT.invalidateQueries({
            queryKey: getGetListsQueryKey(),
          })

          refresh()

          toast.success(dictionary.list_item_actions.cover_changed_successfully)
        },
      },
    )
  }, [dictionary, listItem.backdropPath, listItem.listId, patchBanner, user])

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
            <DropdownMenuItem className="p-0">
              <Link
                href={`/${language}/${listItem.mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${listItem.tmdbId}`}
                className="flex items-center px-2 py-1.5"
              >
                <ExternalLink size={14} className="mr-2" />
                {dictionary.list_item_actions.see_details}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleChangeBackdrop()}
            >
              <Image size={14} className="mr-2" />
              {dictionary.list_item_actions.use_as_cover}
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  deleteListItem.mutateAsync(
                    { id: listItem.id },
                    {
                      onSuccess: async () => {
                        await APP_QUERY_CLIENT.invalidateQueries({
                          queryKey: getGetListItemsByListIdQueryKey(
                            listItem.listId,
                          ),
                        })

                        toast.success(
                          dictionary.list_item_actions.removed_successfully,
                        )
                      },
                    },
                  )
                }
              >
                <Trash size={16} className="mr-2 " />

                {dictionary.list_item_actions.delete}
              </DropdownMenuItem>
            </DropdownMenuSub>
          </>
        ) : (
          <DropdownMenuItem className=" p-0">
            <Link
              href={`/${language}/${listItem.mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${listItem.tmdbId}`}
              className="flex items-center px-2 py-1.5"
            >
              <ExternalLink size={16} className="mr-2" />
              {dictionary.list_item_actions.see_details}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
