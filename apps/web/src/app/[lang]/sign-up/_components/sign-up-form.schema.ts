import { Dictionary } from '@/utils/dictionaries'
import { z } from 'zod'

export const credentialsFormSchema = (dictionary: Dictionary) =>
  z.object({
    email: z
      .string()
      .min(1, dictionary.sign_up_form.email_required)
      .email(dictionary.sign_up_form.email_invalid),

    password: z
      .string()
      .min(1, dictionary.sign_up_form.password_required)
      .min(8, dictionary.sign_up_form.password_length),
  })

export type CredentialsFormValues = z.infer<
  ReturnType<typeof credentialsFormSchema>
>

export const usernameFormSchema = (dictionary: Dictionary) =>
  z.object({
    username: z
      .string()
      .min(1, dictionary.username_required)
      .regex(/^[a-zA-Z0-9_]+$/, dictionary.username_invalid),
  })

export type UsernameFormValues = z.infer<ReturnType<typeof usernameFormSchema>>
