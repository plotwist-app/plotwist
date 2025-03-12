'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Input } from '@plotwist/ui/components/ui/input'
import { Textarea } from '@plotwist/ui/components/ui/textarea'

import { useLanguage } from '@/context/language'

import type { GetListById200List } from '@/api/endpoints.schemas'
import { getGetListsQueryKey, usePostList, usePutListId } from '@/api/list'
import {
  RadioGroup,
  RadioGroupItem,
} from '@plotwist/ui/components/ui/radio-group'
import { type ListFormValues, listFormSchema } from './list-form-schema'

type ListFormProps = { trigger: JSX.Element; list?: GetListById200List }

export const ListForm = ({ trigger, list }: ListFormProps) => {
  const [open, setOpen] = useState(false)
  const { dictionary, language } = useLanguage()
  const { push, refresh } = useRouter()
  const createList = usePostList()
  const editList = usePutListId()
  const queryClient = useQueryClient()

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema(dictionary)),
    defaultValues: {
      title: list?.title ?? '',
      description: list?.description ?? '',
      visibility: list?.visibility ?? 'PUBLIC',
    },
  })

  async function onSubmit(values: ListFormValues) {
    if (list) {
      return editList.mutateAsync(
        { data: values, id: list.id },
        {
          onSuccess: async () => {
            refresh()

            setOpen(false)
            toast.success(dictionary.list_edited_successfully)
          },
        }
      )
    }

    return createList.mutateAsync(
      { data: values },
      {
        onSuccess: async ({ list: { id } }) => {
          await queryClient.invalidateQueries({
            queryKey: getGetListsQueryKey(),
          })

          setOpen(false)
          form.reset()

          toast.success(dictionary.list_created_success, {
            action: {
              label: dictionary.see_list,
              onClick: () => push(`/${language}/lists/${id}`),
            },
          })
        },

        onError: () => {
          toast.error(dictionary.unable_to_create_list)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {list
              ? dictionary.list_form.edit_list
              : dictionary.list_form.create_new_list}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.title}</FormLabel>

                  <FormControl>
                    <Input
                      placeholder={dictionary.list_form.name_placeholder}
                      {...field}
                    />
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
                  <FormLabel>{dictionary.list_form.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={3}
                      placeholder={dictionary.list_form.description_placeholder}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field: { onChange, value } }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{dictionary.list_form.visibility}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={onChange}
                      defaultValue={value}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="PUBLIC" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {dictionary.list_form.visibility_option_public}
                          </FormLabel>
                        </FormItem>
                        <span className="pl-7 text-sm text-muted-foreground">
                          {
                            dictionary.list_form
                              .visibility_option_description_public
                          }
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="NETWORK" disabled />
                          </FormControl>
                          <FormLabel className="font-normal text-muted-foreground">
                            {dictionary.list_form.visibility_option_network}
                          </FormLabel>
                        </FormItem>
                        <span className="pl-7 text-sm text-muted-foreground">
                          {
                            dictionary.list_form
                              .visibility_option_description_network
                          }
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="PRIVATE" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {dictionary.list_form.visibility_option_private}
                          </FormLabel>
                        </FormItem>
                        <span className="pl-7 text-sm text-muted-foreground">
                          {
                            dictionary.list_form
                              .visibility_option_description_private
                          }
                        </span>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="submit" loading={form.formState.isSubmitting}>
                {dictionary.list_form.submit}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
