import { useState } from 'react'
import { toast } from 'sonner'
import { DialogProps } from '@radix-ui/react-dialog'
import { MoreVertical, Pencil, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useReviews } from '@/hooks/use-reviews'
import { useLanguage } from '@/context/language'

type ReviewItemEditActionsProps = { reviewId: string }

export const ReviewItemEditActions = ({
  reviewId,
}: ReviewItemEditActionsProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-6 w-6">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-4">
          <DropdownMenuItem onClick={() => {}}>
            <Pencil size={14} className="mr-2" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            <Trash size={14} className="mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        reviewId={reviewId}
      />
    </>
  )
}

type DeleteDialogProps = { reviewId: string } & DialogProps
export const DeleteDialog = ({
  reviewId,
  ...dialogProps
}: DeleteDialogProps) => {
  const { handleDeleteReview, invalidateQueries } = useReviews()
  const { dictionary } = useLanguage()

  function handleDeleteReviewClick() {
    handleDeleteReview.mutate(reviewId, {
      onSettled: async () => {
        await invalidateQueries(reviewId)
        toast.success(dictionary.review_deleted_successfully)

        if (dialogProps.onOpenChange) {
          dialogProps.onOpenChange(false)
        }
      },

      onError: (error) => {
        toast.error(error.message)
      },
    })
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
              {dictionary.review_item_actions.dialog_close}
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            onClick={() => handleDeleteReviewClick()}
            loading={handleDeleteReview.isPending}
          >
            {dictionary.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
