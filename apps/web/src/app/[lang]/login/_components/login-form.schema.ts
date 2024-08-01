import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const loginFormSchema = (dictionary: Dictionary) =>
  z.object({
    email: z
      .string()
      .min(1, dictionary.login_form.email_required)
      .email(dictionary.login_form.email_invalid),

    password: z
      .string()
      .min(1, dictionary.login_form.password_required)
      .min(8, dictionary.login_form.password_length),
  })

export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>
