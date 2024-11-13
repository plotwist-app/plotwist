'use server'

import type { PostUsersCreateBody } from '@/api/endpoints.schemas'
import { postUsersCreate } from '@/api/users'
import { signIn } from './sign-in'

export async function signUp({
  email,
  password,
  username,
}: PostUsersCreateBody) {
  await postUsersCreate({ email, password, username })
  await signIn({ email, password })
}
