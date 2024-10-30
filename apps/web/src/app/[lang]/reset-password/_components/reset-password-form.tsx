'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Eye, EyeOff } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'

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

import {
  ResetPasswordFormValues,
  resetPasswordFormSchema,
} from './reset-password-form.schema'
import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'
import { useState } from 'react'
import { redirect, useSearchParams } from 'next/navigation'

export const ResetPasswordForm = () => {
  const { dictionary, language } = useLanguage()
  const { resetPassword } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema(dictionary)),
    defaultValues: {
      password: '',
    },
  })

  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  async function onSubmit({ password }: ResetPasswordFormValues) {
    if (!code) return redirect(`/${language}/login`)

    await resetPassword({ password, code })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.password_label}</FormLabel>

              <FormControl>
                <div className="flex space-x-2">
                  <Input
                    placeholder="*********"
                    type={showPassword ? 'text' : 'password'}
                    {...field}
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowPassword((prev) => !prev)}
                          type="button"
                          data-testId="toggle-password"
                        >
                          {showPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>
                          {showPassword
                            ? dictionary.login_form.hide_password
                            : dictionary.login_form.show_password}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
