import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { tmdbImage } from '@/utils/tmdb/image'

type CreditCardProps = {
  imagePath: string
  name: string
  role: string
  href: string
}

export const CreditCard = ({
  imagePath,
  name,
  role,
  href,
}: CreditCardProps) => {
  return (
    <li className="flex items-center gap-2 border-b border-dashed py-3">
      <Link
        href={href}
        className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border"
      >
        {imagePath ? (
          <Image
            loading="lazy"
            src={tmdbImage(imagePath, 'w500')}
            alt={name}
            fill
            className="object-cover"
            sizes="100%"
          />
        ) : (
          <span className="select-none">{name[0]}</span>
        )}
      </Link>

      <div className="flex flex-1 justify-between gap-2 items-center">
        <Link href={href} className="text-sm whitespace-nowrap">
          {name}
        </Link>

        <span className="text-xs text-muted-foreground line-clamp-1 ">
          {role}
        </span>
      </div>
    </li>
  )
}
