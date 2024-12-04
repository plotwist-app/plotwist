import type { DialogProps } from '@radix-ui/react-dialog'
import { MoreVertical, Pencil, Trash } from 'lucide-react'
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

import { useLanguage } from '@/context/language'

import {
  getGetReviewQueryKey,
  getGetReviewsQueryKey,
  useDeleteReviewById,
} from '@/api/reviews'
import { APP_QUERY_CLIENT } from '@/context/app'
import type { ReviewItemProps } from './review-item'
import { ReviewFormDialog } from '../review-form-dialog'

export const ReviewItemEditActions = ({
  review,
}: Pick<ReviewItemProps, 'review'>) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { dictionary } = useLanguage()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-6 w-6">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-4">
          <DropdownMenuItem asChild>
            <ReviewFormDialog
              mediaType={review.mediaType}
              tmdbId={review.tmdbId}
              review={review}
            >
              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted">
                <Pencil size={14} className="mr-2" />
                {dictionary.edit}
              </div>
            </ReviewFormDialog>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            <Trash size={14} className="mr-2" />
            {dictionary.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        review={review}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </>
  )
}

type EditActionDialogProps = Pick<ReviewItemProps, 'review'> & DialogProps

const DeleteDialog = ({ review, ...dialogProps }: EditActionDialogProps) => {
  const deleteReview = useDeleteReviewById()
  const { dictionary } = useLanguage()

  function handleDeleteReviewClick() {
    deleteReview.mutate(
      { id: review.id },
      {
        onSettled: async () => {
          await APP_QUERY_CLIENT.invalidateQueries({
            queryKey: getGetReviewsQueryKey({
              mediaType: review.mediaType,
              tmdbId: String(review.tmdbId),
            }),
          })

          await APP_QUERY_CLIENT.invalidateQueries({
            queryKey: getGetReviewQueryKey({
              mediaType: review.mediaType,
              tmdbId: String(review.tmdbId),
            }),
          })

          toast.success(dictionary.review_deleted_successfully)

          if (dialogProps.onOpenChange) {
            dialogProps.onOpenChange(false)
          }
        },
      }
    )
  }

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-1">
          <DialogTitle>
            {dictionary.review_item_actions.dialog_title}
          </DialogTitle>

          <DialogDescription>
            {dictionary.review_item_actions.dialog_description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:flex-end gap-1">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {dictionary.close}
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            onClick={() => handleDeleteReviewClick()}
            loading={deleteReview.isPending}
          >
            {dictionary.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
