'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language'
import Link from 'next/link'
import { tv } from 'tailwind-variants'

export const socialButton = tv({
  base: 'rounded-lg items-center border text-sm bg-background px-4 py-2 flex gap-2 justify-center cursor-pointer shadow-sm w-full font-semib',
})

export const SignUpSocial = () => {
  const { language } = useLanguage()

  return (
    <div className="flex flex-col gap-2">
      <Button className="border bg-background text-foreground shadow-sm hover:bg-muted/50">
        <img src="/assets/google.svg" className="mr-2 size-4" alt="google" />
        Continue com Google
      </Button>

      <Button className="border bg-background text-foreground shadow-sm hover:bg-muted/50 dark:[&_img]:invert">
        <img src="/assets/x.svg" className="mr-2 size-4" alt="x" /> Continue com
        X
      </Button>

      <div className="flex items-center">
        <div className="flex-1 border-t" />
        <span className="m-4 text-sm font-medium text-muted-foreground/50">
          OU
        </span>
        <div className="flex-1 border-t" />
      </div>

      <Button asChild>
        <Link href={`/${language}/sign-up?provider=email`}>
          Continue com e-mail
        </Link>
      </Button>
    </div>
  )
}
