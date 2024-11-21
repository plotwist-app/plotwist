'use client'

import { Trash } from 'lucide-react'

import { Button } from '@plotwist/ui/components/ui/button'

import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'

import {
  getGetListItemsByListIdQueryKey,
  useDeleteListItemId,
} from '@/api/list-item'
import { APP_QUERY_CLIENT } from '@/context/app'
import type { ListItem } from '@/types/supabase/lists'
import { toast } from 'sonner'

type ListItemActionsProps = {
  listItem: ListItem
}

export const ListItemActions = ({ listItem }: ListItemActionsProps) => {
  const deleteListItem = useDeleteListItemId()

  const { dictionary, language } = useLanguage()
  const { mode } = useListMode()

  if (mode === 'SHOW') return

  return (
    <Button
      size="icon"
      className="h-6 w-6"
      onClick={event => {
        event.stopPropagation()
        event.nativeEvent.preventDefault()
        event.nativeEvent.stopImmediatePropagation()

        deleteListItem.mutateAsync(
          { id: listItem.id },
          {
            onSuccess: async () => {
              await APP_QUERY_CLIENT.invalidateQueries({
                queryKey: getGetListItemsByListIdQueryKey(listItem.listId, {
                  language,
                }),
              })

              toast.success(dictionary.list_item_actions.removed_successfully)
            },
          }
        )
      }}
    >
      <Trash className="h-3 w-3" />
    </Button>

    // <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
    //   <DropdownMenuTrigger asChild>

    //   </DropdownMenuTrigger>

    //   <DropdownMenuContent>
    //     {mode === 'EDIT' ? (
    //       <>
    //         <DropdownMenuItem className="p-0">
    //           <Link
    //             href={`/${language}/${listItem.mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${listItem.tmdbId}`}
    //             className="flex items-center px-2 py-1.5"
    //           >
    //             <ExternalLink size={14} className="mr-2" />
    //             {dictionary.list_item_actions.see_details}
    //           </Link>
    //         </DropdownMenuItem>

    //         <DropdownMenuItem
    //           className="cursor-pointer"
    //           onClick={() => handleChangeBackdrop()}
    //         >
    //           <Image size={14} className="mr-2" />
    //           {dictionary.list_item_actions.use_as_cover}
    //         </DropdownMenuItem>

    //         <DropdownMenuSub>
    //           <DropdownMenuItem
    //             className="cursor-pointer"

    //           >
    //             <Trash size={16} className="mr-2 " />

    //             {dictionary.list_item_actions.delete}
    //           </DropdownMenuItem>
    //         </DropdownMenuSub>
    //       </>
    //     ) : (
    //       <DropdownMenuItem className=" p-0">
    //         <Link
    //           href={`/${language}/${listItem.mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${listItem.tmdbId}`}
    //           className="flex items-center px-2 py-1.5"
    //         >
    //           <ExternalLink size={16} className="mr-2" />
    //           {dictionary.list_item_actions.see_details}
    //         </Link>
    //       </DropdownMenuItem>
    //     )}
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}
