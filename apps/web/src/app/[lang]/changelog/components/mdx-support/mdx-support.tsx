'use client'

import { MDXProvider } from '@mdx-js/react'

import { format } from 'date-fns'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { locale } from '@/utils/date/locale'
import { changelogData } from '../../data'

const components = {}

export const MdxSupport = () => {
  const { language } = useLanguage()

  return (
    <MDXProvider components={components}>
      <div className="space-y-16">
        {changelogData.map((item) => {
          return (
            <div
              className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 lg:grid-cols-3 xl:px-0"
              key={item.date}
            >
              <div className="col-span-1">
                <span className="text-md sticky top-2 text-muted-foreground">
                  {format(new Date(item.date), 'PPP', {
                    locale: locale[language],
                  })}
                </span>
              </div>

              <div className="col-span-2">
                <article
                  className={cn(
                    'prose prose-sm prose-gray max-w-none dark:prose-invert',
                    language === 'de-DE' && '[&_.de-DE]:block',
                    language === 'en-US' && '[&_.en-US]:block',
                    language === 'es-ES' && '[&_.es-ES]:block',
                    language === 'fr-FR' && '[&_.fr-FR]:block',
                    language === 'it-IT' && '[&_.it-IT]:block',
                    language === 'pt-BR' && '[&_.pt-BR]:block',
                    language === 'ja-JP' && '[&_.ja-JP]:block',
                  )}
                >
                  {item.item}
                </article>
              </div>
            </div>
          )
        })}
      </div>
    </MDXProvider>
  )
}
