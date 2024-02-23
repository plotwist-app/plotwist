'use client'

import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { MoreVertical, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { APP_QUERY_CLIENT } from '@/context/app/app'
import { LISTS_QUERY_KEY, useLists } from '@/context/lists'
import { useLanguage } from '@/context/language'

import { tmdbImage } from '@/utils/tmdb/image'

import { List } from '@/types/supabase/lists'
import { useState } from 'react'

type ListCardProps = { list: List }

export const ListCard = ({ list }: ListCardProps) => {
  const { handleDeleteList } = useLists()
  const { language, dictionary } = useLanguage()
  const [open, setOpen] = useState(false)

  const firstBackdropPath = list.cover_path ?? list.list_items[0]?.backdrop_path
  const thumbnail = tmdbImage(firstBackdropPath)

  return (
    <>
      <div className="space-y-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow">
          {firstBackdropPath && (
            <Link
              href={`/${language}/app/lists/${list.id}`}
              className="space-y-2"
            >
              <Image
                fill
                className="object-cover"
                src={thumbnail}
                alt={list.name}
                sizes="100%"
              />
            </Link>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between gap-1">
            <Link
              href={`/${language}/app/lists/${list.id}`}
              className="space-y-2"
            >
              <span>{list.name}</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon" className="h-6 w-6">
                  <MoreVertical size={12} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <Trash size={12} className="mr-2" />
                  {dictionary.list_card.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="line-clamp-3 text-xs text-muted-foreground">
            {list.description}
          </p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1">
            <DialogTitle>{dictionary.list_card.dialog_title}</DialogTitle>
            <DialogDescription>
              {dictionary.list_card.dialog_description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteList.mutate(list.id, {
                  onSuccess: () => {
                    APP_QUERY_CLIENT.invalidateQueries({
                      queryKey: LISTS_QUERY_KEY,
                    })

                    toast.success(dictionary.list_card.delete_success)
                  },
                  onError: (error) => {
                    toast.error(error.message)
                  },
                })
              }}
            >
              {dictionary.list_card.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// onClick={(e) => {
//   e.preventDefault()

//   handleDeleteList.mutate(list.id, {
//     onSuccess: () => {
//       APP_QUERY_CLIENT.invalidateQueries({
//         queryKey: LISTS_QUERY_KEY,
//       })

//       toast.success(dictionary.list_card.delete_success)
//     },
//     onError: (error) => {
//       toast.error(error.message)
//     },
//   })
// }}
