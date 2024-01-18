'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Dictionary } from '@/utils/dictionaries/get-dictionaries.types'

import { SignInCredentials, SignUpCredentials } from './use-auth.types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const useAuth = (dictionary: Dictionary) => {
  const supabase = createClientComponentClient()

  const { push } = useRouter()

  const signInWithCredentials = async (credentials: SignInCredentials) => {
    const { error, data } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      toast.error(dictionary.login_form.invalid_login_credentials, {
        action: {
          label: dictionary.login_form.try_again,
          onClick: () => signInWithCredentials(credentials),
        },
      })

      return
    }

    if (data) {
      push('app')
      toast.success(dictionary.login_form.login_success)
    }
  }

  const signUpWithCredentials = async ({
    username,
    ...credentials
  }: SignUpCredentials) => {
    const { error } = await supabase.auth.signUp({
      ...credentials,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      toast.error(error.message, {
        action: {
          label: ' Try again',
          onClick: () => signUpWithCredentials({ username, ...credentials }),
        },
      })

      return
    }

    push('/login')

    toast.success('Account created successfully! 🎉', {
      action: {
        label: 'Access your account',
        onClick: () => push('/login'),
      },
    })
  }

  return { signInWithCredentials, signUpWithCredentials }
}
