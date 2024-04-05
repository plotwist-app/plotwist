'use client'

import { Badge } from '@/components/ui/badge'
import { HomePrice } from './home-price'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const HomePrices = () => {
  const { language, dictionary } = useLanguage()
  const { user } = useAuth()

  const [subscriptionMode, setSubscriptionMode] = useState<
    'monthly' | 'yearly'
  >('monthly')

  const username = user?.username
  const initial = username ? username[0].toUpperCase() : ''

  return (
    <section
      className="mx-auto max-w-6xl space-y-8 px-4 py-16 lg:px-0"
      id="pricing"
    >
      <div className="mx-auto flex w-full flex-col items-center space-y-2 lg:w-2/3">
        <h2 className="text-center text-2xl font-bold">
          {dictionary.home_prices.title}
        </h2>

        <p className="lg:text-md text-center text-sm text-muted-foreground">
          {dictionary.home_prices.description}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1">
          <Badge
            variant={subscriptionMode === 'monthly' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSubscriptionMode('monthly')}
          >
            {dictionary.home_prices.monthly}
          </Badge>

          <Badge
            variant={subscriptionMode === 'yearly' ? 'default' : 'outline'}
            className="cursor-not-allowed opacity-50"
            // onClick={() => setSubscriptionMode('yearly')}
          >
            {dictionary.home_prices.yearly}
          </Badge>
        </div>

        <ol className="grid-col-1 grid gap-8 lg:grid-cols-3 lg:gap-4">
          <HomePrice.Root>
            <HomePrice.Content>
              <HomePrice.Header>
                <HomePrice.Label>
                  {dictionary.home_prices.free_plan.title}
                </HomePrice.Label>

                <HomePrice.Value>
                  {dictionary.home_prices.free_plan.price}
                </HomePrice.Value>

                <HomePrice.Description>
                  {dictionary.home_prices.free_plan.description}
                </HomePrice.Description>
              </HomePrice.Header>

              <HomePrice.Benefits>
                {dictionary.home_prices.free_plan.benefits.map((benefit) => (
                  <HomePrice.Benefit key={benefit}>{benefit}</HomePrice.Benefit>
                ))}
              </HomePrice.Benefits>
            </HomePrice.Content>

            <Button asChild>
              <Link href={`/${language}/signup`}>
                {dictionary.home_prices.free_plan.start_now}
              </Link>
            </Button>
          </HomePrice.Root>

          {user ? (
            <form
              action={`/api/checkout_sessions?locale=${language.split('-')[0]}&email=${user.email}`}
              method="POST"
            >
              <HomePrice.Root>
                <HomePrice.Content>
                  <HomePrice.Header>
                    <HomePrice.Label>
                      {dictionary.home_prices.member_plan.title}
                    </HomePrice.Label>

                    <HomePrice.Value className="flex items-center gap-2">
                      {dictionary.home_prices.member_plan.price}
                      <Badge variant="outline">
                        {dictionary.home_prices.member_plan.recommended}
                      </Badge>
                    </HomePrice.Value>

                    <HomePrice.Description>
                      {dictionary.home_prices.member_plan.description}
                    </HomePrice.Description>
                  </HomePrice.Header>

                  <HomePrice.Benefits>
                    {dictionary.home_prices.member_plan.benefits.map(
                      (benefit) => (
                        <HomePrice.Benefit key={benefit}>
                          {benefit}
                        </HomePrice.Benefit>
                      ),
                    )}
                  </HomePrice.Benefits>
                </HomePrice.Content>

                <Button type="submit" disabled>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="mr-2 h-6 w-6 border border-muted-foreground text-[10px]">
                          <AvatarFallback className="bg-foreground">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>

                      <TooltipContent>{username}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {dictionary.home_prices.member_plan.subscribe}
                </Button>
              </HomePrice.Root>
            </form>
          ) : (
            <HomePrice.Root>
              <HomePrice.Content>
                <HomePrice.Header>
                  <HomePrice.Label>
                    {dictionary.home_prices.member_plan.title}
                  </HomePrice.Label>

                  <HomePrice.Value className="flex items-center gap-2">
                    {dictionary.home_prices.member_plan.price}
                    <Badge variant="outline">
                      {dictionary.home_prices.member_plan.recommended}
                    </Badge>
                  </HomePrice.Value>

                  <HomePrice.Description>
                    {dictionary.home_prices.member_plan.description}
                  </HomePrice.Description>
                </HomePrice.Header>

                <HomePrice.Benefits>
                  {dictionary.home_prices.member_plan.benefits.map(
                    (benefit) => (
                      <HomePrice.Benefit key={benefit}>
                        {benefit}
                      </HomePrice.Benefit>
                    ),
                  )}
                </HomePrice.Benefits>
              </HomePrice.Content>

              <Button asChild type="button">
                <Link href={`/${language}/login`}>Login</Link>
              </Button>
            </HomePrice.Root>
          )}

          <HomePrice.Root>
            <HomePrice.Content>
              <HomePrice.Header>
                <HomePrice.Label>
                  {dictionary.home_prices.patreon_plan.title}
                </HomePrice.Label>
                <HomePrice.Value>
                  {dictionary.home_prices.patreon_plan.price}
                </HomePrice.Value>

                <Skeleton className="h-[2ex] w-full" />
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

                <HomePrice.Benefit>
                  <Skeleton className="h-[2ex] w-[20ch]" />
                </HomePrice.Benefit>
              </HomePrice.Benefits>
            </HomePrice.Content>

            <Button disabled>
              {dictionary.home_prices.patreon_plan.coming_soon}
            </Button>
          </HomePrice.Root>
        </ol>
      </div>
    </section>
  )
}
