import { Language } from '@/types/languages'
import Link from 'next/link'
import { Logo } from '../logo'
import { Dictionary } from '@/utils/dictionaries'
import { Instagram, Twitter } from 'lucide-react'
import dynamic from 'next/dynamic'

const Video = dynamic(() => import('./video'), { ssr: false })

const INTERESTELAR_ID = '157336'

type FooterProps = { language: Language; dictionary: Dictionary }
export const Footer = ({ language, dictionary }: FooterProps) => {
  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-lg shadow-sm lg:mb-4 lg:border">
      <Link href={`/${language}/movies/${INTERESTELAR_ID}`}>
        <div className="relative aspect-video h-[300px] w-full overflow-hidden md:aspect-auto">
          <Video />
        </div>
      </Link>

      <div
        className="
          mx-auto grid max-w-6xl grid-cols-1 gap-2 border-t leading-7 
          md:grid-cols-3
          [&_h5]:text-lg [&_h5]:font-medium 
          [&_li.disabled]:cursor-not-allowed [&_li.disabled]:opacity-50
          [&_li]:text-muted-foreground 
          [&_section]:space-y-2 [&_section]:p-4 
          [&_ul]:space-y-1 [&_ul]:text-sm [&_ul]:leading-7
        "
      >
        <section className="border-b md:border-b-0 md:border-r ">
          <h5>{dictionary.about_us}</h5>

          <ul>
            <li>
              <Link href={`/${language}#features`}>{dictionary.features}</Link>
            </li>

            <li>
              <Link href={`/${language}/pricing`}>{dictionary.pricing}</Link>
            </li>

            <li className="disabled">{dictionary.download}</li>
          </ul>
        </section>

        <section className="border-b md:border-b-0 md:border-r">
          <h5>{dictionary.community}</h5>

          <ul>
            <li>
              <Link href="https://github.com/plotwist-app/plotwist">
                {dictionary.github}
              </Link>
            </li>

            <li>
              <Link href="https://discord.gg/5E38RcG8xj">
                {dictionary.discord}
              </Link>
            </li>

            <li className="disabled">{dictionary.careers}</li>
            <li className="disabled">{dictionary.brand}</li>
          </ul>
        </section>

        <section className="">
          <h5>{dictionary.legal}</h5>

          <ul>
            <li className="disabled">{dictionary.privacy_policy}</li>
            <li className="disabled">{dictionary.terms_of_service}</li>
          </ul>
        </section>
      </div>

      <div className="border-t p-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <h2 className="text-md font-normal">Plotwist</h2>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {dictionary.plotwist_rights}
            </p>

            <div className="h-3 border-r" />

            <span className=" text-xs text-muted-foreground">
              {dictionary.data_provided_by}
            </span>
          </div>

          <div className="flex items-center gap-2 [&_a>svg]:fill-foreground [&_a>svg]:stroke-background [&_a]:rounded-full [&_a]:border [&_a]:px-3 [&_a]:py-1 [&_a]:shadow">
            <Link href="https://www.instagram.com/plotwist.app/">
              <Instagram size={20} />
            </Link>

            <Link href="https://x.com/plotwist.app">
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
