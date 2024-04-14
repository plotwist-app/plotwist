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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, EyeOff, View } from 'lucide-react'

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
      visibility: list?.visibility ?? 'public',
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
            (query: { data: List }) => {
              const { data } = query

              return {
                ...query,
                data: {
                  ...data,
                  name: variables.name,
                  description: variables.description,
                  visibility: variables.visibility,
                },
              }
            },
          )

          APP_QUERY_CLIENT.setQueryData(['lists', user.id], (query: List[]) => {
            const newData = query.map((list) => {
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
            visibility: 'public',
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
              name="visibility"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel>{dictionary.list_form.visibility}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={onChange}
                      value={value}
                      defaultValue="public"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            dictionary.list_form.visibility_placeholder
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Eye size={16} />
                            {dictionary.list_form.visibility_option_public}
                          </div>
                        </SelectItem>
                        <SelectItem
                          className="flex items-center gap-2"
                          value="network"
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <View size={16} />
                            {dictionary.list_form.visibility_option_network}
                          </div>
                        </SelectItem>
                        <SelectItem
                          className="flex items-center gap-2"
                          value="private"
                        >
                          <div className="flex items-center gap-2">
                            <EyeOff size={16} />
                            {dictionary.list_form.visibility_option_private}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {dictionary.list_form.description}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none"
                            rows={3}
                            placeholder={
                              dictionary.list_form.description_placeholder
                            }
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
