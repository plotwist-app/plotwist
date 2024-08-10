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
import {
  SignUpFormValues,
  UsernameFormValues,
  signUpFormSchema,
  usernameSchema,
} from './sign-up-form.schema'
import { useLanguage } from '@/context/language'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const SignUpForm = () => {
  const { signUpWithCredentials } = useAuth()
  const { dictionary, language } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [open, setOpen] = useState(false)

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema(dictionary)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const usernameForm = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema(dictionary)),
    defaultValues: {
      username: '',
    },
  })

  async function onSubmitSignUp() {
    // todo: e-mail already exists validation
    setOpen(true)
  }

  async function onSubmitUsername({ username }: UsernameFormValues) {
    const values = { ...signUpForm.getValues(), username }
    await signUpWithCredentials(values)
  }

  return (
    <>
      <Form {...signUpForm}>
        <form
          onSubmit={signUpForm.handleSubmit(onSubmitSignUp)}
          className="w-full space-y-4"
        >
          <FormField
            control={signUpForm.control}
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
            control={signUpForm.control}
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
              loading={signUpForm.formState.isSubmitting}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader className="text-start">
            <DialogTitle>{dictionary.pick_your_username}</DialogTitle>
          </DialogHeader>

          <Form {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(onSubmitUsername)}>
              <FormField
                control={usernameForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="TylerDurden" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-4">
                <Button
                  loading={usernameForm.formState.isSubmitting}
                  type="submit"
                >
                  {dictionary.create_account}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
