'use server'

import { postLogin } from '@/api/auth'
import { createSession } from '@/app/lib/session'
import { Dictionary } from '@/utils/dictionaries'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = (dictionary: Dictionary) =>
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

export type FormState =
  | {
      errors?: Partial<Record<'email' | 'password', string[]>>
      message?: string
    }
  | undefined

export async function signIn(
  state: FormState,
  formData: FormData,
  dictionary?: Dictionary,
) {
  if (!dictionary) {
    return
  }

  const validatedFields = schema(dictionary).safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  let token
  let user

  try {
    const response = await postLogin({ email, password })
    token = response.token
    user = response.user

    await createSession({ token, user })
  } catch {
    return state
  }

  redirect('/home')
}
