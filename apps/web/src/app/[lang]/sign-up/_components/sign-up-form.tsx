'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { signUp } from '@/actions/auth/sign-up'
import { getUsersAvailableEmail, getUsersAvailableUsername } from '@/api/users'
import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Input } from '@plotwist/ui/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import { AxiosError } from 'axios'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  type CredentialsFormValues,
  type UsernameFormValues,
  credentialsFormSchema,
  usernameFormSchema,
} from './sign-up-form.schema'

type SignUpFormProps = {
  onSignUp: typeof signUp
}

export const SignUpForm = ({ onSignUp }: SignUpFormProps) => {
  const { dictionary, language } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const searchParams = useSearchParams()
  const redirectToCheckout = searchParams.get('redirect') === 'checkout'

  const credentialsForm = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsFormSchema(dictionary)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const usernameForm = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema(dictionary)),
    defaultValues: {
      username: '',
    },
  })

  async function onSubmitCredentialsForm({ email }: CredentialsFormValues) {
    try {
      await getUsersAvailableEmail({ email })
      setShowUsernameDialog(true)
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status === 409) {
          credentialsForm.setError('email', {
            message: dictionary.email_already_taken,
          })
        }
      }
    }
  }

  async function onSubmitUsernameForm({ username }: UsernameFormValues) {
    try {
      await getUsersAvailableUsername({ username })

      const values = {
        ...credentialsForm.getValues(),
        ...usernameForm.getValues(),
      }

      await onSignUp({
        ...values,
        redirectToCheckout,
        language,
      })

      toast.success(dictionary.sign_up_form.sign_up_success)
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status === 409) {
          return usernameForm.setError('username', {
            message: dictionary.username_already_taken,
          })
        }
      }

      return toast.error(dictionary.sign_up_form.invalid_sign_up_credentials)
    }
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

          <FormField
            control={credentialsForm.control}
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
                            onClick={() => setShowPassword(prev => !prev)}
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
