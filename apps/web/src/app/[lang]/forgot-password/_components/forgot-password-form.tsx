'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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

import { useLanguage } from '@/context/language'
import {
  type ForgotPasswordFormValues,
  forgotPasswordFormSchema,
} from './forgot-password-form.schema'

export const ForgotPasswordForm = () => {
  const { dictionary } = useLanguage()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema(dictionary)),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    console.log({ values })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.login_label}</FormLabel>

              <FormControl>
                <Input placeholder="email@domain.com" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
          >
            {dictionary.submit_button}
          </Button>
        </div>
      </form>
    </Form>
  )
}
