'use client'

import { MoreVertical, Trash } from 'lucide-react'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import type { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { getGetListsQueryKey, useDeleteListId } from '@/api/list'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

type ListCardProps = { list: GetLists200ListsItem }

export const ListCard = ({ list }: ListCardProps) => {
  const { language, dictionary } = useLanguage()
  const { user } = useSession()
  const deleteList = useDeleteListId()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)

  const isOwner = user?.id === list.userId

  const href = `/${language}/lists/${list.id}`

  return (
    <>
      <div className="space-y-2 ">
        <Link href={href}>
          <div
            className={cn(
              'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border-dashed border bg-background/50',
              list.bannerUrl && 'border border-solid'
            )}
          >
            {list.bannerUrl && (
              <Image
                fill
                className="object-cover"
                src={list.bannerUrl}
                alt={list.title}
                sizes="100%"
              />
            )}
          </div>
        </Link>

        <div className="space-y-1">
          <div className="flex justify-between gap-2 items-start">
            <Link href={href} className="hover:underline font-medium">
              {list.title}
            </Link>

            {isOwner && (
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
            )}
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
                {dictionary.list_card.dialog_close}
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={() => {
                deleteList.mutateAsync(
                  { id: list.id },
                  {
                    onSuccess: async () => {
                      await queryClient.invalidateQueries({
                        queryKey: getGetListsQueryKey(),
                      })

                      setOpen(false)
                      toast.success(dictionary.list_card.delete_success)
                    },
                    onError: error => {
                      toast.error(error.message)
                    },
                  }
                )
              }}
              loading={deleteList.isPending}
            >
              {dictionary.list_card.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const ListCardSkeleton = () => {
  return (
    <>
      <div className="space-y-2">
        <div className="aspect-video w-full overflow-hidden rounded-md border bg-background/50">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between gap-1">
            <Skeleton className="h-[2ex] w-[20ch]" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    </>
  )
}
