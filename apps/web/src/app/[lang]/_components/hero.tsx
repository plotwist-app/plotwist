import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { Smartphone } from 'lucide-react'
import { Link } from 'next-view-transitions'
import type { Dictionary } from '@/utils/dictionaries'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

type HeroProps = {
  dictionary: Dictionary
}

export async function Hero({ dictionary }: HeroProps) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-12 text-center md:px-6 md:py-28">
      <Link href="#pricing">
        <Badge variant="outline" className="bg-background">
          {dictionary.community_badge}
        </Badge>
      </Link>

      <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-7xl md:leading-[1.1]">
        {dictionary.hero_title_line1}
        <br />
        <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          {dictionary.hero_title_line2}
        </span>
      </h1>

      <p className="max-w-xl text-base text-muted-foreground md:text-lg">
        {dictionary.hero_subtitle}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="#pricing">{dictionary.hero_cta_web}</Link>
        </Button>

        <Button variant="outline" size="lg" asChild>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
            <Smartphone className="mr-2 h-4 w-4" />
            {dictionary.hero_cta_app}
          </a>
        </Button>
      </div>
    </section>
  )
}
