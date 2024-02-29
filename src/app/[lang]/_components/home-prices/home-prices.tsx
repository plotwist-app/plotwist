import { Badge } from '@/components/ui/badge'
import { HomePrice } from './home-price'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Language } from '@/types/languages'

type HomePricesProps = {
  language: Language
}

export const HomePrices = ({ language }: HomePricesProps) => {
  return (
    <section className="mx-auto max-w-article space-y-8 p-4 py-16">
      <div className="mx-auto flex w-full flex-col items-center space-y-2 lg:w-2/3">
        <h2 className="text-center text-2xl font-bold">
          Start your journey today
        </h2>

        <p className="lg:text-md text-center text-sm text-muted-foreground">
          Start creating realtime design experiences for free. Upgrade for extra
          features and collaboration with your team.
        </p>
      </div>

      <ol className="grid-col-1 grid gap-8 lg:grid-cols-3 lg:gap-4">
        <HomePrice.Root>
          <HomePrice.Content>
            <HomePrice.Header>
              <HomePrice.Label>Free</HomePrice.Label>
              <HomePrice.Value>$0/month</HomePrice.Value>
              <HomePrice.Description>
                Explore about movies and build your personal watch-list.
              </HomePrice.Description>
            </HomePrice.Header>

            <HomePrice.Benefits>
              <HomePrice.Benefit>Full access to the platform</HomePrice.Benefit>
              <HomePrice.Benefit>Unlimited reviews</HomePrice.Benefit>
              <HomePrice.Benefit>One personal list</HomePrice.Benefit>
            </HomePrice.Benefits>
          </HomePrice.Content>

          <Button asChild>
            <Link href={`/${language}/signup`}>Start now!</Link>
          </Button>
        </HomePrice.Root>

        <HomePrice.Root className="relative">
          <HomePrice.Content>
            <HomePrice.Header>
              <HomePrice.Label>Member</HomePrice.Label>

              <HomePrice.Value>$5/month</HomePrice.Value>

              <HomePrice.Description>
                Everything in Free plain, plus higher limits, custom settings
                and no third-party ads.
              </HomePrice.Description>
            </HomePrice.Header>

            <HomePrice.Benefits>
              <HomePrice.Benefit>Removal of third-party ads</HomePrice.Benefit>
              <HomePrice.Benefit>Personal recommendations</HomePrice.Benefit>
              <HomePrice.Benefit>
                Clone your own or other members’ lists
              </HomePrice.Benefit>
              <HomePrice.Benefit>Change your username </HomePrice.Benefit>
            </HomePrice.Benefits>
          </HomePrice.Content>

          <Badge className="absolute top-0 -translate-y-2">Recommended</Badge>

          <Button>Subscribe</Button>
        </HomePrice.Root>

        <HomePrice.Root>
          <HomePrice.Content>
            <HomePrice.Header>
              <HomePrice.Label>Patreon</HomePrice.Label>
              <HomePrice.Value>$10/month</HomePrice.Value>

              <HomePrice.Description>
                Everything in Member plus no more limits and early-access to
                features.
              </HomePrice.Description>
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
    </section>
  )
}
