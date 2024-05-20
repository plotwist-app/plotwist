'use client'

import { useForm } from 'react-hook-form'
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

import { useLists } from '@/context/lists'
import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import { APP_QUERY_CLIENT } from '@/context/app/app'
import { listPageQueryKey } from '@/utils/list'

import { List } from '@/types/supabase/lists'

import { ListFormValues, listFormSchema } from './list-form-schema'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type ListFormProps = { trigger: JSX.Element; list?: List }

export const ListForm = ({ trigger, list }: ListFormProps) => {
  const { handleCreateNewList, handleEditList } = useLists()
  const { user } = useAuth()
  const { dictionary } = useLanguage()

  const [open, setOpen] = useState(false)

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema(dictionary)),
    defaultValues: {
      name: list?.name ?? '',
      description: list?.description ?? '',
      visibility: list?.visibility ?? 'PUBLIC',
    },
  })

  async function onSubmit(values: ListFormValues) {
    if (!user) return

    if (list) {
      const { name, description, visibility } = values

      const variables = {
        name,
        description,
        visibility,
        id: list.id,
      }

      return await handleEditList.mutateAsync(variables, {
        onSuccess: () => {
          APP_QUERY_CLIENT.setQueryData(
            listPageQueryKey(variables.id),
            (previous: List) => {
              return {
                ...previous,
                name: variables.name,
                description: variables.description,
                visibility: variables.visibility,
              }
            },
          )

          APP_QUERY_CLIENT.setQueryData(['lists', user.id], (data: List[]) => {
            const newData = data.map((list) => {
              if (list.id === variables.id) {
                return {
                  ...list,
                  name: variables.name,
                  description: variables.description,
                  visibility: variables.visibility,
                }
              }

              return list
            })

            return newData
          })

          setOpen(false)
          toast.success(dictionary.list_form.list_edited_success)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      })
    }

    await handleCreateNewList.mutateAsync(
      { ...values, userId: user.id },
      {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: ['lists', user.id],
          })

          setOpen(false)
          form.reset({
            description: '',
            name: '',
            visibility: 'PUBLIC',
          })

          toast.success(dictionary.list_form.list_created_success)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.list_form.name}</FormLabel>
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
