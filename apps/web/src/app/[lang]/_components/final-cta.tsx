import { Button } from '@plotwist/ui/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'next-view-transitions'
import type { Dictionary } from '@/utils/dictionaries'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

type FinalCtaProps = {
  dictionary: Dictionary
  language: string
}

export function FinalCta({ dictionary, language }: FinalCtaProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-foreground/[0.03] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-24 lg:py-32 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          {dictionary.final_cta_title}
        </h2>

        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {dictionary.final_cta_subtitle}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="h-12 rounded-full px-8 bg-foreground text-background shadow-lg hover:bg-foreground/90"
            asChild
          >
            <Link href={`/${language}/sign-up`}>
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
