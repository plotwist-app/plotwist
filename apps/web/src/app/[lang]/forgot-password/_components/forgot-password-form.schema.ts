import type { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const forgotPasswordFormSchema = (dictionary: Dictionary) =>
  z.object({
    email: z
      .string()
      .min(1, dictionary.email_required)
      .email(dictionary.email_invalid),
  })

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof forgotPasswordFormSchema>
>
