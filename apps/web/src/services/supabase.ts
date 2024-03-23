import { createClient } from '@supabase/supabase-js'
import { env } from 'process'

const supabaseURL = env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseURL, supabaseKey)
