'use client'

import { useCallback, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

import { useLanguage } from '@/context/language'

import { Dictionary } from '@/utils/dictionaries'
import { updateProfileUsername } from '@/services/api/profiles'

import { Profile } from '@/types/supabase'
import { useAuth } from '@/context/auth'

const nameRegex = /^[a-zA-Z0-9-]+$/

export const profileFormSchema = (dictionary: Dictionary, username: string) =>
  z.object({
    name: z
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

        if (username === value) {
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
  profile: Profile
}

export const ProfileForm = ({ trigger, profile }: ProfileFormProps) => {
  const [open, setOpen] = useState(false)

  const { push } = useRouter()
  const { dictionary, language } = useLanguage()
  const { user } = useAuth()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(dictionary, profile.username)),
    defaultValues: {
      name: profile.username,
    },
  })

  const isUserPro = useMemo(
    () => profile.subscription_type === 'PRO',
    [profile],
  )

  const isUserOwner = useMemo(() => profile.id === user?.id, [profile, user])

  const onSubmit = useCallback(
    async (values: ProfileFormValues) => {
      if (!isUserPro) return

      await updateProfileUsername({
        id: profile.id,
        newUsername: values.name,
      })

      push(`/${language}/${values.name}`)

      form.reset()
    },
    [form, isUserPro, language, profile.id, push],
  )

  if (!isUserOwner) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
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
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isUserPro}
                      placeholder="John"
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
                Change
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
