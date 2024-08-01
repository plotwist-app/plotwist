import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const signUpFormSchema = (dictionary: Dictionary) =>
  z.object({
    username: z
      .string()
      .min(1, dictionary.sign_up_form.username_required)
      .regex(/^[a-zA-Z0-9-]+$/, dictionary.sign_up_form.username_invalid),

    email: z
      .string()
      .min(1, dictionary.sign_up_form.email_required)
      .email(dictionary.sign_up_form.email_invalid),

    password: z
      .string()
      .min(1, dictionary.sign_up_form.password_required)
      .min(8, dictionary.sign_up_form.password_length),
  })

export type SignUpFormValues = z.infer<ReturnType<typeof signUpFormSchema>>
