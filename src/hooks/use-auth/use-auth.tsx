import { supabase } from '@/services/supabase'
import { Credentials } from './use-auth.types'
import { toast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'

export const useAuth = () => {
  const signInWithCredentials = async (credentials: Credentials) => {
    const { error, data } = await supabase.auth.signInWithPassword(credentials)

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

    toast({
      description: 'Login successful. Welcome!',
    })
  }

  return { signInWithCredentials }
}
