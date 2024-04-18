import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

export async function getProfilesBySubscriptionType(
  subscriptionType: Profile['subscription_type'],
) {
  const { data: users } = await supabase
    .from('profiles')
    .select()
    .eq('subscription_type', subscriptionType)
    .returns<Profile[]>()

  return users || []
}
