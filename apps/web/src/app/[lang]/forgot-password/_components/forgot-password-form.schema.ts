import type { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const forgotPasswordFormSchema = (dictionary: Dictionary) =>
  z.object({
    login: z.string().min(1, dictionary.login_required),
  })

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof forgotPasswordFormSchema>
>
