import type { Dictionary } from '@/utils/dictionaries'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { Link } from 'next-view-transitions'

type HeroProps = {
  dictionary: Dictionary
}

export async function Hero({ dictionary }: HeroProps) {
  return (
    <section className="mx-auto max-w-4xl flex flex-col gap-6 items-center py-24 text-center">
      <Badge variant="outline">{dictionary.community_badge}</Badge>

      <h2 className="text-6xl leading-[1.2]">
        {dictionary.perfect_place_for_watching} <b>{dictionary.everything}</b>
      </h2>

      <p className="text-muted-foreground text-lg max-w-2xl">
        {dictionary.manage_rate_discover}
      </p>

      <Button asChild>
        <Link href="#pricing">{dictionary.start_now}</Link>
      </Button>
    </section>
  )
}
