import { Button } from '@plotwist/ui/components/ui/button'
import { Smartphone } from 'lucide-react'
import type { Dictionary } from '@/utils/dictionaries'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

type AppDownloadProps = {
  dictionary: Dictionary
}

export function AppDownload({ dictionary }: AppDownloadProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 lg:px-0">
      <div className="flex flex-col items-center gap-6 rounded-lg border bg-gradient-to-b from-transparent to-muted/30 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted">
          <Smartphone className="h-6 w-6" />
        </div>

        <h2 className="text-2xl font-semibold md:text-4xl">
          {dictionary.app_section_title}
        </h2>

        <p className="max-w-lg text-muted-foreground">
          {dictionary.app_section_subtitle}
        </p>

        <Button size="lg" asChild>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
            <Smartphone className="mr-2 h-4 w-4" />
            {dictionary.hero_cta_app}
          </a>
        </Button>
      </div>
    </section>
  )
}
