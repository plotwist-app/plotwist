import { cn } from '@/lib/utils'
import { Language } from '@/types/languages'
import Link from 'next/link'
import { ComponentProps, PropsWithChildren } from 'react'
import { Badge } from '../ui/badge'

const Section = {
  Root: (props: PropsWithChildren) => <div className="space-y-1" {...props} />,
  Label: (props: PropsWithChildren) => (
    <h4 className="text-sm font-semibold" {...props} />
  ),
  List: (props: PropsWithChildren) => (
    <ul className="space-y-1 text-xs" {...props} />
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

type FooterProps = { language: Language }
export const Footer = ({ language }: FooterProps) => {
  return (
    <footer className="px-4">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 border-t py-12">
        <div className="col-span-2 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">[TMDB]</h2>

              <div>
                <Badge variant="outline">
                  <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                  Status: All systems working
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              © tmdb-front-end.vercel.app. All rights reserved.
            </p>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">
              Data provided by{' '}
              <Link
                className="underline"
                href="https://www.themoviedb.org/"
                target="_blank"
              >
                TMDB
              </Link>
              .
            </span>
          </div>
        </div>

        <div className="col-span-1 grid grid-cols-2">
          <Section.Root>
            <Section.Label>Product</Section.Label>

            <Section.List>
              <Section.Item>
                <Link href={`/${language}#features`}>Features</Link>
              </Section.Item>

              <Section.Item>
                <Link href={`/${language}#pricing`}>Pricing</Link>
              </Section.Item>

              <Section.Item>
                <Link href={`/${language}/changelog`}>Changelog</Link>
              </Section.Item>

              <Section.Item disabled>Download</Section.Item>
            </Section.List>
          </Section.Root>

          <Section.Root>
            <Section.Label>Company</Section.Label>

            <Section.List>
              <Section.Item disabled>About us</Section.Item>
              <Section.Item disabled>Careers</Section.Item>
              <Section.Item disabled>Brand</Section.Item>
            </Section.List>
          </Section.Root>

          {/* <Section.Root>
            <Section.Label>Developers</Section.Label>

            <Section.List>
              <Section.Item disabled>Status</Section.Item>
              <Section.Item disabled>GitHub</Section.Item>
            </Section.List>
          </Section.Root> */}
        </div>
      </div>
    </footer>
  )
}
