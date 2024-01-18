'use client'

import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Dictionary } from '@/utils/dictionaries/get-dictionaries.types'

import { SignInCredentials, SignUpCredentials } from './use-auth.types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Language } from '@/types/languages'

export const useAuth = (dictionary: Dictionary) => {
  const supabase = createClientComponentClient()

  const { push } = useRouter()
  const lang = useParams<{ lang: Language }>()

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

    toast.success(dictionary.sign_up_form.sign_up_success)
    await signInWithCredentials(credentials)
  }

  return { signInWithCredentials, signUpWithCredentials }
}
