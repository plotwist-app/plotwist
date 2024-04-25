'use client'

import { useCallback, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from 'sonner'
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

import { Profile } from '@/types/supabase'
import { useAuth } from '@/context/auth'
import { useProfile } from '@/hooks/use-profile'

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
  const { updateUsernameMutation } = useProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(dictionary, profile.username)),
    defaultValues: {
      name: profile.username,
    },
  })

  const isUserPro = profile.subscription_type === 'PRO'

  const onSubmit = useCallback(
    async (values: ProfileFormValues) => {
      if (!isUserPro) return

      const { error } = await updateUsernameMutation.mutateAsync({
        userId: user!.id,
        newUsername: values.name,
      })

      if (error) {
        if (error.code === 'P0001') {
          toast.error(
            `${dictionary.profile_form.username_label} ${values.name} ${dictionary.profile_form.error_existent_username}`,
          )
          return
        }

        toast.error(error.message)
        return
      }

      push(`/${language}/${values.name}`)
    },
    [
      dictionary.profile_form.error_existent_username,
      dictionary.profile_form.username_label,
      isUserPro,
      language,
      push,
      updateUsernameMutation,
      user,
    ],
  )

  if (!user) return null

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
