import { cn } from '@/lib/utils'
import { Language } from '@/types/languages'
import Link from 'next/link'
import { ComponentProps, PropsWithChildren } from 'react'
import { Badge } from '../ui/badge'
import { Dictionary } from '@/utils/dictionaries'

const Section = {
  Root: (props: PropsWithChildren) => <div className="space-y-1" {...props} />,
  Label: (props: PropsWithChildren) => (
    <h4 className="text-md font-semibold" {...props} />
  ),
  List: (props: PropsWithChildren) => (
    <ul className="space-y-1 text-sm leading-7" {...props} />
  ),
  Item: ({
    disabled,
    className,
    ...props
  }: PropsWithChildren & ComponentProps<'li'> & { disabled?: boolean }) => (
    <li
      className={cn(
        className,
        disabled && 'cursor-not-allowed select-none text-muted-foreground',
      )}
      {...props}
    />
  ),
}

type FooterProps = { language: Language; dictionary: Dictionary }
export const Footer = ({ language, dictionary }: FooterProps) => {
  const {
    footer: { status, rights, data_provided_by: provided, sections },
  } = dictionary

  return (
    <footer className="px-4">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 border-t py-12 lg:grid-cols-3 lg:gap-4">
        <div className="col-span-2 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Plotwist</h2>

              <div>
                <Badge variant="outline">
                  <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                  {status}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{rights}</p>
          </div>

          <div>
            <Link
              href="https://www.themoviedb.org/"
              className="text-xs text-muted-foreground"
              target="blank"
            >
              {provided}
            </Link>
          </div>
        </div>

        <div className="col-span-1 grid grid-cols-3 gap-4">
          <Section.Root>
            <Section.Label>{sections.product}</Section.Label>

            <Section.List>
              <Section.Item>
                <Link href={`/${language}#features`}>{sections.features}</Link>
              </Section.Item>

              <Section.Item>
                <Link href={`/${language}#pricing`}>{sections.pricing}</Link>
              </Section.Item>

              <Section.Item>
                <Link href={`/${language}/changelog`}>
                  {sections.changelog}
                </Link>
              </Section.Item>

              <Section.Item disabled>{sections.download}</Section.Item>
            </Section.List>
          </Section.Root>

          <Section.Root>
            <Section.Label>{sections.company}</Section.Label>

            <Section.List>
              <Section.Item disabled>{sections.about_us}</Section.Item>
              <Section.Item disabled>{sections.careers}</Section.Item>
              <Section.Item disabled>{sections.brand}</Section.Item>
            </Section.List>
          </Section.Root>

          <Section.Root>
            <Section.Label>{sections.developers}</Section.Label>

            <Section.List>
              <Section.Item disabled>{sections.status}</Section.Item>
              <Section.Item disabled>{sections.github}</Section.Item>
            </Section.List>
          </Section.Root>
        </div>
      </div>
    </footer>
  )
}
