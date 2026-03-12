import { Button } from '@plotwist/ui/components/ui/button'
import { Link } from 'next-view-transitions'
import type { Dictionary } from '@/utils/dictionaries'

type FinalCtaProps = {
  dictionary: Dictionary
  language: string
}

export function FinalCta({ dictionary, language }: FinalCtaProps) {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-4 py-16 lg:py-24 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
          {dictionary.final_cta_title}
        </h2>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {dictionary.final_cta_subtitle}
        </p>

        <div className="mt-6">
          <Button
            className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90"
            asChild
          >
            <Link href={`/${language}/sign-up`}>
              {dictionary.hero_cta_web}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
