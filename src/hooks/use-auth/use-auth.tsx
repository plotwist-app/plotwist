'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { SignInCredentials, SignUpCredentials } from './use-auth.types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '@/context/language'
import { APP_QUERY_CLIENT } from '@/context/app/app'

export const useAuth = () => {
  const { dictionary, language } = useLanguage()
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
          label: dictionary.login_form.try_again,
          onClick: () => signUpWithCredentials({ username, ...credentials }),
        },
      })

      return
    }

    toast.success(dictionary.sign_up_form.sign_up_success)
    await signInWithCredentials(credentials)
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message, {
        action: {
          label: dictionary.sign_up_form.try_again,
          onClick: () => logout(),
        },
      })

      return
    }

    push(`/${language}`)
    toast.success(dictionary.auth.logout_success)
  }

  return { signInWithCredentials, signUpWithCredentials, logout }
}
