import { Confetti } from '@/components/confetti'
import { Pattern } from '@/components/pattern'

import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Check, Copy, List, Play, User } from 'lucide-react'

export default async function Home({ params: { lang } }: PageProps) {
  const {
    thank_you: {
      title,
      description,
      subtitle,
      feature1,
      feature2,
      feature3,
      feature4,
    },
  } = await getDictionary(lang)
  return (
    <>
      <Pattern variant="checkered" />
      <Confetti />

      <main className="mx-auto mt-16 flex min-h-[calc(100dvh-69px)] max-w-6xl flex-col items-center justify-center gap-16 p-4 md:mt-0 xl:p-0">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center rounded-full bg-foreground p-2 text-background shadow">
            <Check size={48} />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold lg:text-4xl">{title}</h1>
            <span className="lg:text-md text-sm text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-center text-sm text-muted-foreground">
            {description}
          </h2>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="space-y-6 rounded-lg border bg-background p-4 shadow">
              <List />

              <div>
                <h4 className="font-bold">{feature1.title}</h4>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  {feature1.description}
                </p>
              </div>
            </li>

            <li className="space-y-6 rounded-lg border bg-background p-4 shadow">
              <Play />

              <div>
                <h4 className="font-bold">{feature2.title}</h4>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  {feature2.description}
                </p>
              </div>
            </li>

            <li className="space-y-6 rounded-lg border bg-background p-4 shadow">
              <Copy />

              <div>
                <h4 className="font-bold">{feature3.title}</h4>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  {feature3.description}
                </p>
              </div>
            </li>

            <li className="space-y-6 rounded-lg border bg-background p-4 shadow">
              <User />

              <div>
                <h4 className="font-bold">{feature4.title}</h4>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  {feature4.description}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </>
  )
}
