import { SignInCredentials, SignUpCredentials } from './use-auth.types'
import { toast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const useAuth = () => {
  const supabase = createClientComponentClient()
  const { push } = useRouter()

  const signInWithCredentials = async (credentials: SignInCredentials) => {
    const { error } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      toast({
        variant: 'destructive',
        title: error.name,
        description: <span>{error.message}</span>,
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => signInWithCredentials(credentials)}
          >
            Try again
          </ToastAction>
        ),
      })

      return
    }

    push('/app')

    toast({
      description: 'Login successful. Welcome! 🎉',
    })
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
      toast({
        variant: 'destructive',
        description: error.message,
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => signUpWithCredentials({ username, ...credentials })}
          >
            Try again
          </ToastAction>
        ),
      })

      return
    }

    push('/login')

    toast({
      description: 'Account created with successfully! 🎉',
      action: (
        <ToastAction
          altText="Access your account"
          onClick={() => push('/login')}
        >
          Access now!
        </ToastAction>
      ),
    })
  }

  return { signInWithCredentials, signUpWithCredentials }
}
