'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@plotwist/ui/components/ui/form'

import { Input } from '@plotwist/ui/components/ui/input'
import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import {
  credentialsFormSchema,
  CredentialsFormValues,
  usernameFormSchema,
  UsernameFormValues,
} from './sign-up-form.schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'

export const SignUpForm = () => {
  const { signInWithOTP } = useAuth()
  const { dictionary } = useLanguage()
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)

  const credentialsForm = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsFormSchema(dictionary)),
    defaultValues: {
      email: '',
    },
  })

  const usernameForm = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema(dictionary)),
    defaultValues: {
      username: '',
    },
  })

  function onSubmitCredentialsForm() {
    // TODO: VALIDAR SE EMAIL ESTÁ EM USO
    setShowUsernameDialog(true)
  }

  async function onSubmitUsernameForm() {
    const values = {
      ...credentialsForm.getValues(),
      ...usernameForm.getValues(),
    }

    await signInWithOTP(values.email)
  }

  return (
    <>
      <Form {...credentialsForm}>
        <form
          onSubmit={credentialsForm.handleSubmit(onSubmitCredentialsForm)}
          className="w-full space-y-4"
        >
          <FormField
            control={credentialsForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@domain.com"
                    {...field}
                    autoComplete="email"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full justify-end">
            <Button
              type="submit"
              className="w-full"
              loading={credentialsForm.formState.isSubmitting}
            >
              {dictionary.continue}
            </Button>
          </div>
        </form>

        {/* <Link
          href={`/${language}/sign-up`}
          className="mt-4 flex items-center justify-center gap-2 text-sm"
        >
          <ChevronLeft className="size-3.5" />
          {dictionary.others_ways}
        </Link> */}
      </Form>

      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dictionary.select_your_username}</DialogTitle>
            <DialogDescription>
              {dictionary.select_your_username_description}
            </DialogDescription>
          </DialogHeader>

          <Form {...usernameForm}>
            <form
              onSubmit={usernameForm.handleSubmit(onSubmitUsernameForm)}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <div className="">
                  <FormField
                    control={usernameForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormControl>
                          <Input placeholder="john-doe" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">{dictionary.finish_sign_up}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
