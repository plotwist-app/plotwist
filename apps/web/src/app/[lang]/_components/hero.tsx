'use client'

import Link from 'next/link'

import { Button } from '@plotwist/ui/components/ui/button'
import { BlurFade } from '@plotwist/ui/components/magicui/blur-fade'

import { ProBadge } from '@/components/pro-badge'

import { useLanguage } from '@/context/language'

const BLUR_FADE_DELAY = 0.04

export const Hero = () => {
  const { language, dictionary } = useLanguage()

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex w-full flex-col items-center space-y-8 px-4 py-36 text-center xl:px-0">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <Link
            href={`/${language}/pricing`}
            className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs shadow"
          >
            {dictionary.discover_advantages} <ProBadge />
          </Link>
        </BlurFade>

        <div className="space-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="text-2xl font-bold xl:text-5xl">
              <h2>{dictionary.welcome_to_plotwist}</h2>
              <h1>{dictionary.your_cinema_platform}</h1>
            </div>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <p className="text-md leading-6 text-muted-foreground">
              {dictionary.join_plotwist}
            </p>
          </BlurFade>
        </div>

        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/${language}/sign-up`}>
                {dictionary.create_account}
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href={`/${language}/home`}>{dictionary.explore}</Link>
            </Button>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
