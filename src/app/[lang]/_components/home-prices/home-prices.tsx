import { Badge } from '@/components/ui/badge'
import { HomePrice } from './home-price'
import { Check } from 'lucide-react'

export const HomePrices = () => {
  return (
    <section className="mx-auto max-w-article space-y-8">
      <div className="mx-auto flex w-2/3 flex-col items-center space-y-2">
        <h2 className="text-2xl font-bold">Start your journey today</h2>

        <p className="text-center text-muted-foreground">
          Start creating realtime design experiences for free. Upgrade for extra
          features and collaboration with your team.
        </p>
      </div>

      <ol className="grid grid-cols-3 gap-4">
        <HomePrice.Root>
          <HomePrice.Header>
            <HomePrice.Label>Free</HomePrice.Label>
            <HomePrice.Value>$0/month</HomePrice.Value>
            <HomePrice.Description>
              Explore about movies and build your personal watch-list.
            </HomePrice.Description>
          </HomePrice.Header>

          <HomePrice.Benefits>
            <li className="flex">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted p-1">
                <Check className="w-3" />
              </div>
            </li>
          </HomePrice.Benefits>
        </HomePrice.Root>

        <HomePrice.Root className="relative">
          <HomePrice.Header>
            <HomePrice.Label>Member</HomePrice.Label>
            <HomePrice.Value>
              $5/month <Badge variant="outline">Recommended</Badge>
            </HomePrice.Value>

            <HomePrice.Description>
              Everything in Free plain, plus higher limits, custom settings and
              no third-party ads.
            </HomePrice.Description>
          </HomePrice.Header>

          <HomePrice.Benefits></HomePrice.Benefits>
        </HomePrice.Root>

        <HomePrice.Root>
          <HomePrice.Header>
            <HomePrice.Label>Patreon</HomePrice.Label>
            <HomePrice.Value>$10/month</HomePrice.Value>

            <HomePrice.Description>
              Everything in Member plus no more limits and early-access to
              features.
            </HomePrice.Description>
          </HomePrice.Header>

          <HomePrice.Benefits></HomePrice.Benefits>
        </HomePrice.Root>
      </ol>
    </section>
  )
}
