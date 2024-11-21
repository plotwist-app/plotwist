import type { DialogProps } from '@radix-ui/react-dialog'
import { MoreVertical, Pencil, Trash } from 'lucide-react'
import { useState } from 'react'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Textarea } from '@plotwist/ui/components/ui/textarea'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

import type { Reply } from '@/types/supabase/reviews'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type ReplyFormValues, replyFormSchema } from '../review-reply-form'

type ReplyEditActionsProps = { reply: Reply }

export const ReplyEditActions = ({ reply }: ReplyEditActionsProps) => {
  const [openEditDialog, setOpenEditDialog] = useState(false)
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
          <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
            <Pencil size={14} className="mr-2" />
            {dictionary.edit}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            <Trash size={14} className="mr-2" />
            {dictionary.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDialog
        reply={reply}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />

      <DeleteDialog
        reply={reply}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </>
  )
}

type EditActionDialogProps = Pick<ReplyEditActionsProps, 'reply'> & DialogProps
const DeleteDialog = ({ reply, ...dialogProps }: EditActionDialogProps) => {
  const { dictionary } = useLanguage()

  function handleDeleteReviewClick() {
    console.log({ reply })
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
            loading={false}
          >
            {dictionary.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const EditDialog = ({ reply, ...dialogProps }: EditActionDialogProps) => {
  const { dictionary } = useLanguage()
  const { user } = useSession()

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema(dictionary)),
    defaultValues: {
      reply: reply.reply,
    },
  })

  const onSubmit = (values: ReplyFormValues) => {
    console.log({ values })
  }

  const username = user?.username

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-1">
          <DialogTitle>{dictionary.edit_reply}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start space-x-4"
          >
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {username}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="reply"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="sm:flex-end gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {dictionary.close}
            </Button>
          </DialogClose>

          <Button onClick={form.handleSubmit(onSubmit)} loading={false}>
            {dictionary.edit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
