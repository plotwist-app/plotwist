'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import { Input } from '@plotwist/ui/components/ui/input'

import { useLanguage } from '@/context/language'

import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'
import { toast } from 'sonner'

const loginFormSchema = (dictionary: Dictionary) =>
  z.object({
    email: z
      .string()
      .min(1, dictionary.email_required)
      .email(dictionary.email_invalid),

    password: z
      .string()
      .min(1, dictionary.password_required)
      .min(8, dictionary.password_length),
  })

type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>

type SignInFormProps = {
  onSignIn: (values: LoginFormValues) => Promise<void>
}

export const SignInForm = ({ onSignIn }: SignInFormProps) => {
  const { dictionary } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema(dictionary)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await onSignIn(values)
      toast.success(dictionary.login_form.login_success)
    } catch {
      toast.error(dictionary.login_form.invalid_login_credentials)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.email_label}</FormLabel>

              <FormControl>
                <Input placeholder="email@domain.com" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button
          type="submit"
          className="w-full"
          loading={form.formState.isSubmitting}
        >
          {dictionary.access_button}
        </Button>
      </form>
    </Form>
  )
}
