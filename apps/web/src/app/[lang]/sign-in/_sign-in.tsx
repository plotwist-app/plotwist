'use client'

import { signIn, FormState } from '@/actions/auth/sign-in'
import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'
import { Input } from '@plotwist/ui/components/ui/input'
import { Label } from '@plotwist/ui/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

export function SignIn() {
  const { dictionary } = useLanguage()
  const [state, action] = useFormState(
    (state: FormState, payload: FormData) => signIn(state, payload, dictionary),
    undefined,
  )

  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="space-y-4 flex justify-end flex-col">
      <div className="space-y-2">
        <Label htmlFor="email">{dictionary.email_label}</Label>
        <Input id="email" name="email" type="email" placeholder="Email" />

        {state?.errors?.email && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {state.errors?.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dictionary.password_label}</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="*********"
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
          />

          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowPassword((prev) => !prev)}
            type="button"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>
        </div>

        {state?.errors?.password && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {state.errors?.password[0]}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { dictionary } = useLanguage()

  return (
    <Button loading={pending} type="submit">
      {dictionary.access_button}
    </Button>
  )
}
