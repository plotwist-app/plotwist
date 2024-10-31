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

import { LoginFormValues, loginFormSchema } from './login-form.schema'
import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'
import { AnimatedLink } from '@/components/animated-link'

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)

  const { dictionary, language } = useLanguage()
  const { signInWithCredentials } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema(dictionary)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    await signInWithCredentials(values)
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

        <div className="flex justify-between items-end space-x-2">
          <AnimatedLink
            href={`/${language}/forgot-password`}
            className="text-sm"
          >
            {dictionary.forgot_your_password}
          </AnimatedLink>

          <Button type="submit" loading={form.formState.isSubmitting}>
            {dictionary.access_button}
          </Button>
        </div>
      </form>
    </Form>
  )
}
