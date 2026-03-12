import { Button } from '@plotwist/ui/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/utils/dictionaries'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

type AppDownloadProps = {
  dictionary: Dictionary
}

export function AppDownload({ dictionary }: AppDownloadProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 lg:px-0 lg:py-16">
      <div className="relative overflow-hidden rounded-2xl bg-foreground/[0.02] dark:bg-foreground/[0.03] ring-1 ring-foreground/[0.06]">
        <div className="flex flex-col items-center gap-4 px-8 py-12 text-center md:px-16 md:py-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-label="Apple"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            iOS
          </div>

          <h2 className="max-w-md text-2xl font-bold tracking-tight md:text-4xl">
            {dictionary.app_section_title}
          </h2>

          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            {dictionary.app_section_subtitle}
          </p>

          <Button
            className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90"
            asChild
          >
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
              {dictionary.hero_cta_app}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
