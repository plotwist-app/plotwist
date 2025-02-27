import type { Dictionary } from '@/utils/dictionaries'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { Link } from 'next-view-transitions'

type HeroProps = {
  dictionary: Dictionary
}

export async function Hero({ dictionary }: HeroProps) {
  return (
    <section className="mx-auto max-w-4xl flex flex-col gap-4 items-center py-8 md:py-24 px-4 md:px-6 text-center h-[80dvh] md:h-auto justify-center">
      <Link href="#pricing">
        <Badge variant="outline" className="bg-background">
          {dictionary.community_badge}
        </Badge>
      </Link>

      <h2 className="text-3xl md:text-6xl leading-tight md:leading-[1.2]">
        {dictionary.perfect_place_for_watching} <b>{dictionary.everything}</b>
      </h2>

      <p className="text-base text-muted-foreground max-w-xs md:max-w-2xl">
        {dictionary.manage_rate_discover}
      </p>

      <Button size="sm" asChild>
        <Link href="#pricing">{dictionary.start_now}</Link>
      </Button>
    </section>
  )
}
