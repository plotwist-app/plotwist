'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQueryState } from 'nuqs'

import { ChevronLeft } from 'lucide-react'

import { Button } from '@plotwist/ui/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Input } from '@plotwist/ui/components/ui/input'

import { LoginFormValues, loginFormSchema } from './login-form.schema'
import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'

export const LoginOTP = () => {
  const { dictionary, language } = useLanguage()
  const { signInWithOTP } = useAuth()
  const [step, setStep] = useQueryState('step')

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema(dictionary)),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit({ email }: LoginFormValues) {
    await signInWithOTP(email)
    setStep('verification')
  }

  if (step === 'verification') {
    return (
      <div className=" flex flex-col items-center space-y-4">
        <p className="text-center text-muted-foreground">
          {dictionary.sent_access_link} <b>{form.getValues('email')}</b>
        </p>

        <Link className="flex items-center gap-2" href={`/${language}/login`}>
          <ChevronLeft size="16" />
          {dictionary.back}
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.login_form.email_label}</FormLabel>

              <FormControl>
                <Input placeholder="email@domain.com" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {dictionary.login_form.access_button}
          </Button>
        </div>
      </form>
    </Form>
  )
}
