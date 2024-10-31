'use server'

import { postLogin } from '@/api/auth'
import { createSession } from '@/app/lib/session'
import { z } from 'zod'

const schema = z.object({
  email: z.string().min(1, 'required').email('invalid'),
  password: z.string().min(1, 'required').min(8, 'minimo 8'),
})

type FormState =
  | {
      errors?: Partial<Record<'email' | 'password', string[]>>
      message?: string
    }
  | undefined

export async function signIn(state: FormState, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const { email, password } = validatedFields.data

  try {
    const { token, user } = await postLogin({ email, password })
    await createSession({ token, user })

    return state
  } catch {
    return state
  }
}
