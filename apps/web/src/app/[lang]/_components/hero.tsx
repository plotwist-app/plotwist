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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-foreground/[0.03] blur-[100px]" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 pt-16 pb-12 text-center md:px-6 md:pt-32 md:pb-20">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span>{dictionary.hero_badge_opensource}</span>
          <span className="text-foreground/20">·</span>
          <span>{dictionary.hero_badge_platforms}</span>
          <span className="text-foreground/20">·</span>
          <span>{dictionary.hero_badge_languages}</span>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-8xl md:leading-[0.95]">
          {dictionary.hero_title_line1}
          <br />
          <span className="text-muted-foreground">
            {dictionary.hero_title_line2}
          </span>
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {dictionary.hero_subtitle}
        </p>

        <div className="flex flex-col items-center gap-4 pt-2">
          <Button
            size="lg"
            className="h-12 rounded-full px-8 bg-foreground text-background shadow-lg hover:bg-foreground/90"
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
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {dictionary.hero_cta_app_inline}
          </a>
        </div>
      </div>
    </section>
  )
}
