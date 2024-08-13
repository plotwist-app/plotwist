'use client'

import Link from 'next/link'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language'
import { supabase } from '@/services/supabase'

export const socialButton = tv({
  base: 'rounded-lg items-center border text-sm bg-background px-4 py-2 flex gap-2 justify-center cursor-pointer shadow-sm w-full font-semib',
})

export const SignUpSocial = () => {
  const { language, dictionary } = useLanguage()

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="border bg-background text-foreground shadow-sm hover:bg-muted/50"
        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
      >
        <img src="/assets/google.svg" className="mr-2 size-4" alt="google" />
        {dictionary.continue_with_google}
      </Button>

      {/* <Button
        className="cursor-not-allowed border bg-background text-foreground opacity-50 shadow-sm hover:bg-muted/50 dark:[&_img]:invert"
        onClick={() => signInWithProvider('twitter')}
      >
        <img src="/assets/x.svg" className="mr-2 size-4" alt="x" />{' '}
        {dictionary.continue_with_x}
      </Button> */}

      <div className="flex items-center">
        <div className="flex-1 border-t" />
        <span className="m-4 text-sm font-medium uppercase text-muted-foreground/50">
          {dictionary.or}
        </span>
        <div className="flex-1 border-t" />
      </div>

      <Button asChild>
        <Link href={`/${language}/sign-up?provider=email`}>
          {dictionary.continue_with_email}
        </Link>
      </Button>
    </div>
  )
}
