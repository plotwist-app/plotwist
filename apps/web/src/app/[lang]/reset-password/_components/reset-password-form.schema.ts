import { z } from 'zod'
import type { Dictionary } from '@/utils/dictionaries'

export const resetPasswordFormSchema = (dictionary: Dictionary) =>
  z.object({
    password: z
      .string()
      .min(1, dictionary.password_required)
      .min(8, dictionary.password_length),
  })

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof resetPasswordFormSchema>
>
