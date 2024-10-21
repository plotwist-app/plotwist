import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const loginFormSchema = (dictionary: Dictionary) =>
  z.object({
    email: z
      .string()
      .min(1, dictionary.login_form.email_required)
      .email(dictionary.login_form.email_invalid),
  })

export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>
