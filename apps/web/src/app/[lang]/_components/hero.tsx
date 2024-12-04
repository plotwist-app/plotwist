'use client'

import { BlurFade } from '@plotwist/ui/components/magicui/blur-fade'
import { Button } from '@plotwist/ui/components/ui/button'

import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { tmdbImage } from '@/utils/tmdb/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'

const BLUR_FADE_DELAY = 0.04

export const Brush = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 418 42"
    className="absolute left-0 top-2/3 h-[0.58em] w-full fill-muted-foreground -z-10"
    preserveAspectRatio="none"
  >
    <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
  </svg>
)

export const Hero = () => {
  const { dictionary } = useLanguage()
  const { user } = useSession()

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex w-full flex-col items-center space-y-8 px-4 py-36 text-center xl:px-0">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <button
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({
                behavior: 'smooth',
              })
            }}
            className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs"
            type="button"
          >
            {dictionary.discover_advantages} <ProBadge />
          </button>
        </BlurFade>

        <div>
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight md:text-7xl max-w-4xl mx-auto">
              {dictionary.organize}{' '}
              <span className="relative whitespace-nowrap font-bold">
                <span className="z-10">{dictionary.movies_and_series}</span>
                <Brush />
              </span>{' '}
              {dictionary.never_been_easier}
            </h1>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <p className="text-muted-foreground max-w-2xl text-md sm:text-lg tracking-tight mx-auto mt-6">
              {dictionary.most_apps_functional}{' '}
              {dictionary.plotwist_incredible_interface}
            </p>
          </BlurFade>
        </div>

        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="flex-col md:flex-row flex gap-2">
            <Button
              disabled={user?.subscriptionType === 'PRO'}
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
            >
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="mr-2 h-6 w-6 border border-muted-foreground text-[10px]">
                        {user.imagePath && (
                          <AvatarImage
                            src={tmdbImage(user.imagePath, 'w500')}
                            className="object-cover"
                            alt={user.username}
                          />
                        )}

                        <AvatarFallback className="bg-foreground">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>

                    <TooltipContent>{user.username}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <p>
                {user?.subscriptionType === 'PRO'
                  ? dictionary.already_in_pro
                  : dictionary.get_14_days_free}
              </p>
            </Button>

            <Button variant="outline" asChild>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
                type="button"
              >
                {dictionary.keep_exploring}
              </button>
            </Button>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
