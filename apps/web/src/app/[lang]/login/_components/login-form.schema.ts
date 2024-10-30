import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const loginFormSchema = (dictionary: Dictionary) =>
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

export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>
