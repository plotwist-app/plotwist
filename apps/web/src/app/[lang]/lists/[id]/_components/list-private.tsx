import { Pattern } from '@/components/pattern'
import { useLanguage } from '@/context/language'
import { Button } from '@plotwist/ui/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const ListPrivate = () => {
  const { language, dictionary } = useLanguage()

  return (
    <div className="flex min-h-[calc(100dvh-69px)] items-center justify-center">
      <Pattern variant="checkered" />

      <div className="flex w-full flex-col items-center gap-4 p-4 text-center lg:w-1/3">
        {/* <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow">
          <Image
            src="/images/private-list/mib.jpg"
            alt=""
            fill
            className="brightness-50"
          />
        </div> */}

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold lg:text-4xl">
            {dictionary.private_list.title}
          </h1>

          <p className="lg:text-md text-sm text-muted-foreground">
            {dictionary.private_list.description}
          </p>
        </div>

        <Button size="sm" asChild variant="outline">
          <Link href={`/${language}/lists`}>
            <ArrowLeft className="mr-1" size={12} />
            {dictionary.private_list.cta}
          </Link>
        </Button>
      </div>
    </div>
  )
}
