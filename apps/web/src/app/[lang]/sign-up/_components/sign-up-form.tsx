'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import { supabase } from '@/services/supabase'
import { useQueryState } from 'nuqs'
import { Confetti } from '@/components/confetti'

export const SignUpForm = () => {
  const { signUpWithOTP } = useAuth()
  const { dictionary } = useLanguage()
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [step, setStep] = useQueryState('step', { shallow: false })

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

  async function onSubmitCredentialsForm(values: CredentialsFormValues) {
    const { data } = await supabase
      .from('profiles')
      .select('email', { count: 'exact' })
      .eq('email', values.email)

    const emailAlreadyRegistered = data && data?.length > 0

    if (emailAlreadyRegistered) {
      return credentialsForm.setError('email', {
        message: dictionary.email_already_registered,
      })
    }

    setShowUsernameDialog(true)
  }

  async function onSubmitUsernameForm(values: UsernameFormValues) {
    const { data } = await supabase
      .from('profiles')
      .select()
      .eq('username', values.username)

    const usernameAlreadyRegistered = data && data?.length > 0

    if (usernameAlreadyRegistered) {
      return usernameForm.setError('username', {
        message: dictionary.username_already_registered,
      })
    }

    const allValues = {
      ...credentialsForm.getValues(),
      ...usernameForm.getValues(),
    }

    await signUpWithOTP(allValues.email, allValues.username)
    setStep('success')
  }

  useEffect(() => {
    if (step === 'success' && !credentialsForm.getValues('email')) {
      setStep('form')
    }
  }, [credentialsForm, setStep, step])

  if (step === 'success') {
    return (
      <div className=" flex flex-col items-center space-y-4">
        <p className="text-center text-muted-foreground">
          Enviamos seu link de acesso para{' '}
          <b>{credentialsForm.getValues('email')}</b>
        </p>

        <Confetti />
      </div>
    )
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
                <Button
                  type="submit"
                  loading={usernameForm.formState.isSubmitting}
                >
                  {dictionary.finish_sign_up}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
