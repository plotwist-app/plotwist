import { z } from 'zod'
import type { Dictionary } from '@/utils/dictionaries'

export const forgotPasswordFormSchema = (dictionary: Dictionary) =>
  z.object({
    login: z.string().min(1, dictionary.login_required),
  })

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof forgotPasswordFormSchema>
>
