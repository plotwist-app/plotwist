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

const nameRegex = /^[a-zA-Z0-9-]+$/

export const profileFormSchema = (
  dictionary: Dictionary,
  newUsername: string,
) =>
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

export type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>

type ProfileFormProps = {
  trigger: JSX.Element
  profile: GetUsersUsername200User
}

export const ProfileForm = ({ trigger, profile }: ProfileFormProps) => {
  const [open, setOpen] = useState(false)

  const { dictionary } = useLanguage()
  const { user } = useSession()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(dictionary, profile.username)),
    defaultValues: {
      username: profile.username,
    },
  })

  const isUserPro = profile.subscriptionType === 'PRO'
  const isOwner = profile.id === user?.id

  const onSubmit = useCallback(async (values: ProfileFormValues) => {
    console.log({ values })
  }, [])

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
