import { supabase } from '@/services/supabase'
import { Credentials } from './use-auth.types'
import { toast } from '@/components/ui/use-toast'

export const useAuth = () => {
  const signInWithCredentials = async (credentials: Credentials) => {
    const { error, data } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      return console.error(JSON.stringify(error))
    }

    toast({
      title: 'Supabase response:',
      description: (
        <pre className="mt-2 max-h-[50vh] w-[340px] overflow-y-auto rounded-md bg-zinc-900 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return { signInWithCredentials }
}
