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
import { Input } from '@plotwist/ui/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'

import { useLanguage } from '@/context/language'

import type { signIn } from '@/actions/auth/sign-in'
import type { Dictionary } from '@/utils/dictionaries'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'
import { toast } from 'sonner'
import { z } from 'zod'

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
  onSignIn: typeof signIn
}

export const SignInForm = ({ onSignIn }: SignInFormProps) => {
  const { dictionary, language } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema(dictionary)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await onSignIn({
        ...values,
        redirectTo: `/${language}/home`,
      })

      if (response?.status) {
        return setWarningDialogOpen(true)
      }

      return toast.success(dictionary.login_form.login_success)
    } catch (error) {
      toast.error(dictionary.login_form.invalid_login_credentials)
    }
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
                            onClick={() => setShowPassword(prev => !prev)}
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

      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent>
          <DialogTitle>{dictionary.legacy_user.title}</DialogTitle>

          <p>{dictionary.legacy_user.description}</p>

          <DialogFooter className="sm:space-y-0 space-y-2">
            <Button variant="outline">
              {dictionary.legacy_user.resend_email}
            </Button>

            <Button onClick={() => setWarningDialogOpen(false)}>
              {dictionary.legacy_user.agree}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
