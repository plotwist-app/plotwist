'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input } from '@plotwist/ui/components/ui/input'
import { Button } from '@plotwist/ui/components/ui/button'

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
import { Textarea } from '@plotwist/ui/components/ui/textarea'

const nameRegex = /^[a-zA-Z0-9-]+$/

export const userFormSchema = (dictionary: Dictionary) =>
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
      }),
    biography: z.string().max(200, 'Limite máximo de caracteres.'),
  })

export type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>

type UserFormProps = {
  user: GetUsersUsername200User
  onClose: () => void
}

export const UserForm = ({ user, onClose }: UserFormProps) => {
  const { dictionary, language } = useLanguage()
  const session = useSession()
  const { mutateAsync } = usePatchUser()
  const { push, refresh } = useRouter()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema(dictionary)),
    defaultValues: {
      username: user.username,
      biography: user.biography || '',
    },
  })

  const isUserPro = user.subscriptionType === 'PRO'
  const isOwner = session?.user?.id === user?.id

  const onSubmit = async (values: UserFormValues) => {
    const sendUsername = values.username !== session.user?.username
    const sendBiography = values.biography !== session.user?.biography

    await mutateAsync(
      {
        data: {
          ...(sendUsername && { username: values.username }),
          ...(sendBiography && { biography: values.biography }),
        },
      },
      {
        onSuccess: ({ user }) => {
          push(`/${language}/${user.username}/`)
          refresh()
          onClose()
        },
        onError: () => {
          form.setError('username', {
            message: `${dictionary.profile_form.username_label} ${values.username} ${dictionary.profile_form.error_existent_username}`,
          })
        },
      },
    )
  }

  if (!user || !isOwner) return null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.profile_form.username_label}</FormLabel>
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

        <FormField
          control={form.control}
          name="biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.biography}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={dictionary.biography_placeholder}
                  rows={4}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            loading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            {dictionary.profile_form.submit_button}
          </Button>
        </div>
      </form>
    </Form>
  )
}
