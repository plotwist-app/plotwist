import { Link } from 'next-view-transitions'
import type { Dictionary } from '@/utils/dictionaries'
import { Logo } from '../logo'

type FooterProps = { language: string; dictionary: Dictionary }

export const Footer = ({ language, dictionary }: FooterProps) => {
  return (
    <footer className="w-full border-t border-foreground/[0.06] mt-4">
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between px-4 gap-4 xl:px-0 md:flex-row flex-col">
          <div className="flex items-center gap-3">
            <Logo size={20} />

            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Plotwist
            </span>

            <span className="text-muted-foreground/30">·</span>

            <span className="text-xs text-muted-foreground">
              {dictionary.data_provided_by}
            </span>
          </div>

          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link
              href={`/${language}/docs`}
              className="transition-colors hover:text-foreground"
            >
              {dictionary.documentation}
            </Link>

            <Link
              href={`/${language}/privacy`}
              className="transition-colors hover:text-foreground"
            >
              {dictionary.privacy_policy}
            </Link>

            <Link
              href="https://discord.gg/ZsBJm9Qk"
              className="transition-colors hover:text-foreground"
            >
              Discord
            </Link>

            <Link
              href="https://github.com/plotwist-app/plotwist"
              className="transition-colors hover:text-foreground"
            >
              Github
            </Link>

            <Link
              href="https://x.com/plotwist_cinema"
              className="transition-colors hover:text-foreground"
            >
              X
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
