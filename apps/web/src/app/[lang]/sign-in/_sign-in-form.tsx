'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'
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
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { signIn } from '@/actions/auth/sign-in'
import { useLanguage } from '@/context/language'
import type { Dictionary } from '@/utils/dictionaries'

const loginFormSchema = (dictionary: Dictionary) =>
  z.object({
    login: z.string().min(1, dictionary.login_required),

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
      login: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const { status } = await onSignIn({
        ...values,
        redirectTo: `/${language}/home`,
      })

      if (status) {
        return setWarningDialogOpen(true)
      }

      return toast.success(dictionary.login_form.login_success)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NEXT_REDIRECT') {
          return toast.success(dictionary.login_form.login_success)
        }
      }

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
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.login_label}</FormLabel>

                <FormControl>
                  <Input
                    placeholder={dictionary.login_placeholder}
                    {...field}
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
            {/* <Button variant="outline">
              {dictionary.legacy_user.resend_email}
            </Button> */}

            <Button onClick={() => setWarningDialogOpen(false)}>
              {dictionary.legacy_user.agree}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
