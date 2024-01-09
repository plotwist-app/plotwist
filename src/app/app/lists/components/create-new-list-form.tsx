'use client'

import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

import { LISTS_QUERY_KEY, useLists } from '@/context/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useAuth } from '@/context/auth'

const createNewListFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
})

export const CreateNewListForm = () => {
  const { handleCreateNewList } = useLists()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof createNewListFormSchema>>({
    resolver: zodResolver(createNewListFormSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof createNewListFormSchema>) {
    await handleCreateNewList.mutateAsync(
      { ...values, userId: user.id },
      {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: LISTS_QUERY_KEY,
          })

          setOpen(false)
          form.reset({
            description: '',
            name: '',
          })
          toast.success('List created successfully!')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="aspect-video rounded-md border border-dashed">
          Create new list
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new list</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Watchlist" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Movies and TV shows I plan to watch."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="submit" loading={form.formState.isSubmitting}>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
