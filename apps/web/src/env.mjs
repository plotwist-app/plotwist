import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  shared: {},
  server: {},
  client: {
    // Client-side variables (accessible from the browser)
    NEXT_PUBLIC_TMDB_API_KEY: z.string(),
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },
  runtimeEnv: {
    // Destructure all variables from `process.env` to ensure they aren't tree-shaken away
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MEASUREMENT_ID: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
})
