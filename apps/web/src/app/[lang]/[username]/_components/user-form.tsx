'use client'

import { useCallback, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input } from '@plotwist/ui/components/ui/input'
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

import { useLanguage } from '@/context/language'

import { Dictionary } from '@/utils/dictionaries'

import { useSession } from '@/context/session'
import { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { usePatchUser } from '@/api/users'
import { useRouter } from 'next/navigation'

const nameRegex = /^[a-zA-Z0-9-]+$/

export const userFormSchema = (dictionary: Dictionary, newUsername: string) =>
  z.object({
    username: z
      .string()
      .min(1, dictionary.profile_form.username_required)
      .superRefine((value, ctx) => {
        const nameTest = nameRegex.test(value)

        if (!nameTest) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: dictionary.profile_form.username_invalid,
            fatal: true,
          })

          return z.NEVER
        }

        if (newUsername === value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: dictionary.profile_form.same_username,
          })
        }
      }),
  })

export type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>

type UserFormProps = {
  trigger: JSX.Element
  user: GetUsersUsername200User
}

export const UserForm = ({ trigger, user }: UserFormProps) => {
  const [open, setOpen] = useState(false)

  const { dictionary, language } = useLanguage()
  const session = useSession()
  const { mutateAsync } = usePatchUser()
  const { push, refresh } = useRouter()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema(dictionary, user.username)),
    defaultValues: {
      username: user.username,
    },
  })

  const isUserPro = user.subscriptionType === 'PRO'
  const isOwner = session?.user?.id === user?.id

  const onSubmit = useCallback(
    async (values: UserFormValues) => {
      await mutateAsync(
        { data: { username: values.username } },
        {
          onSuccess: ({ user }) => {
            push(`/${language}/${user.username}/`)
            refresh()
          },
          onError: () => {
            form.setError('username', {
              message: `${dictionary.profile_form.username_label} ${values.username} ${dictionary.profile_form.error_existent_username}`,
            })
          },
        },
      )
    },
    [mutateAsync, push, language, refresh, form, dictionary],
  )

  if (!user || !isOwner) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dictionary.profile_form.dialog_title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.profile_form.username_label}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isUserPro}
                      placeholder={dictionary.profile_form.username_placeholder}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                disabled={!isUserPro}
                type="submit"
                loading={form.formState.isSubmitting}
              >
                {dictionary.profile_form.submit_button}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
