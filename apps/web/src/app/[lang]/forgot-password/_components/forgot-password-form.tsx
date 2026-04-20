'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { requestPasswordReset } from '@/actions/auth/request-password-reset'
import { useLanguage } from '@/context/language'
import {
  type ForgotPasswordFormValues,
  forgotPasswordFormSchema,
} from './forgot-password-form.schema'

type ForgotPasswordFormProps = {
  onRequest: typeof requestPasswordReset
}

export const ForgotPasswordForm = ({ onRequest }: ForgotPasswordFormProps) => {
  const { dictionary } = useLanguage()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema(dictionary)),
    defaultValues: {
      login: '',
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    const result = await onRequest({ login: values.login })

    if (result?.error) {
      toast.error(dictionary.request_password_reset_error)
      return
    }

    toast.success(dictionary.request_password_reset_form_response)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.login_label}</FormLabel>

              <FormControl>
                <Input placeholder={dictionary.login_placeholder} {...field} />
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
