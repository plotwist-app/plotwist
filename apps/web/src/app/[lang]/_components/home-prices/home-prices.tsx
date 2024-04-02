'use client'

import { Badge } from '@/components/ui/badge'
import { HomePrice } from './home-price'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Language } from '@/types/languages'
import { useState } from 'react'

type HomePricesProps = {
  language: Language
}

export const HomePrices = ({ language }: HomePricesProps) => {
  const [subscriptionMode, setSubscriptionMode] = useState<
    'monthly' | 'yearly'
  >('monthly')

  return (
    <section
      className="mx-auto max-w-6xl space-y-8 px-4 py-16 lg:px-0"
      id="pricing"
    >
      <div className="mx-auto flex w-full flex-col items-center space-y-2 lg:w-2/3">
        <h2 className="text-center text-2xl font-bold">
          Start your journey today
        </h2>

        <p className="lg:text-md text-center text-sm text-muted-foreground">
          Embrace the world of movies and TV shows like never before. Start your
          Plotwist journey today and become a part of a growing community of
          cinema enthusiasts!
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Badge
            variant={subscriptionMode === 'monthly' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSubscriptionMode('monthly')}
          >
            Monthly
          </Badge>

          <Badge
            variant={subscriptionMode === 'yearly' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSubscriptionMode('yearly')}
          >
            Yearly
          </Badge>
        </div>

        <ol className="grid-col-1 grid gap-8 lg:grid-cols-3 lg:gap-4">
          <HomePrice.Root>
            <HomePrice.Content>
              <HomePrice.Header>
                <HomePrice.Label>Free</HomePrice.Label>
                <HomePrice.Value>R$0/month</HomePrice.Value>
                <HomePrice.Description>
                  Explore about movies and build your personal watch-list.
                </HomePrice.Description>
              </HomePrice.Header>

              <HomePrice.Benefits>
                <HomePrice.Benefit>
                  Full access to the platform
                </HomePrice.Benefit>
                <HomePrice.Benefit>Unlimited reviews</HomePrice.Benefit>
                <HomePrice.Benefit>One personal list</HomePrice.Benefit>
              </HomePrice.Benefits>
            </HomePrice.Content>

            <Button asChild>
              <Link href={`/${language}/signup`}>Start now!</Link>
            </Button>
          </HomePrice.Root>

          <form
            action={`/api/checkout_sessions?locale=${language.split('-')[0]}`}
            method="POST"
          >
            <HomePrice.Root>
              <HomePrice.Content>
                <HomePrice.Header>
                  <HomePrice.Label>Member</HomePrice.Label>

                  <HomePrice.Value className="flex items-center gap-2">
                    $3/month <Badge variant="outline">Recommended</Badge>
                  </HomePrice.Value>

                  <HomePrice.Description>
                    Everything in Free plain, plus higher limits, custom
                    settings and no third-party ads.
                  </HomePrice.Description>
                </HomePrice.Header>

                <HomePrice.Benefits>
                  <HomePrice.Benefit>Unlimited lists</HomePrice.Benefit>
                  <HomePrice.Benefit>
                    Personal recommendations based in personal taste
                  </HomePrice.Benefit>
                  <HomePrice.Benefit>
                    Clone your own or other members’ lists
                  </HomePrice.Benefit>
                  <HomePrice.Benefit>Change your username</HomePrice.Benefit>
                </HomePrice.Benefits>
              </HomePrice.Content>

              <Button>Subscribe</Button>
            </HomePrice.Root>
          </form>

          <HomePrice.Root>
            <HomePrice.Content>
              <HomePrice.Header>
                <HomePrice.Label>Patreon</HomePrice.Label>
                <HomePrice.Value>$10/month</HomePrice.Value>

                <Skeleton className="h-[2ex] w-full" />
              </HomePrice.Header>

              <HomePrice.Benefits>
                <HomePrice.Benefit>
                  <Skeleton className="h-[2ex] w-[20ch]" />
                </HomePrice.Benefit>

                <HomePrice.Benefit>
                  <Skeleton className="h-[2ex] w-[20ch]" />
                </HomePrice.Benefit>

                <HomePrice.Benefit>
                  <Skeleton className="h-[2ex] w-[20ch]" />
                </HomePrice.Benefit>
              </HomePrice.Benefits>
            </HomePrice.Content>

            <Button disabled>Coming soon</Button>
          </HomePrice.Root>
        </ol>
      </div>
    </section>
  )
}
