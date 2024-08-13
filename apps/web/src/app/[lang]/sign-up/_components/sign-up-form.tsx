'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/auth'
import { SignUpFormValues, signUpFormSchema } from './sign-up-form.schema'
import { useLanguage } from '@/context/language'

export const SignUpForm = () => {
  const { signUpWithCredentials } = useAuth()
  const { dictionary, language } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema(dictionary)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: SignUpFormValues) {
    await signUpWithCredentials(values)
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="email@domain.com"
                    {...field}
                    autoComplete="email"
                  />
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
                            data-testid="toggle-password"
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
                              ? dictionary.sign_up_form.hide_password
                              : dictionary.sign_up_form.show_password}
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

          <div className="flex w-full justify-end">
            <Button
              type="submit"
              className="w-full"
              loading={form.formState.isSubmitting}
            >
              {dictionary.continue}
            </Button>
          </div>
        </form>

        <Link
          href={`/${language}/sign-up`}
          className="mt-4 flex items-center justify-center gap-2 text-sm"
        >
          <ChevronLeft className="size-3.5" />
          {dictionary.others_ways}
        </Link>
      </Form>
    </>
  )
}
