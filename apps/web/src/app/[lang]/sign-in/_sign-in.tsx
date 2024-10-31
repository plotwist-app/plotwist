'use client'

import { signIn } from '@/actions/auth'
import { useFormState, useFormStatus } from 'react-dom'

export function SignIn() {
  const [state, action] = useFormState(signIn, undefined)

  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" />
      </div>
      {state?.errors?.email && <p>{state.errors?.email}</p>}

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      {state?.errors?.password && <p>{state.errors?.password}</p>}

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} type="submit">
      {pending ? 'Loading' : 'Sign In'}
    </button>
  )
}
