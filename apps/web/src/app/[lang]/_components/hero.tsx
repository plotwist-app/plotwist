import { Button } from '@plotwist/ui/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'next-view-transitions'
import type { Dictionary } from '@/utils/dictionaries'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

type HeroProps = {
  dictionary: Dictionary
}

export async function Hero({ dictionary }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 pt-12 pb-6 text-center md:px-6 md:pt-24 md:pb-10">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground tracking-wide">
          <span>{dictionary.hero_badge_opensource}</span>
          <span className="text-foreground/15">·</span>
          <span>{dictionary.hero_badge_platforms}</span>
          <span className="text-foreground/15">·</span>
          <span>{dictionary.hero_badge_languages}</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl md:leading-[1.05]">
          {dictionary.hero_title_line1}
          <br />
          <span className="text-muted-foreground">
            {dictionary.hero_title_line2}
          </span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
          {dictionary.hero_subtitle}
        </p>

        <div className="flex flex-col items-center gap-3 pt-1">
          <Button
            size="lg"
            className="h-11 rounded-full px-7 bg-foreground text-background hover:bg-foreground/90"
            asChild
          >
            <Link href="#pricing">
              {dictionary.hero_cta_web}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            {dictionary.hero_cta_app_inline}
          </a>
        </div>
      </div>
    </section>
  )
}
