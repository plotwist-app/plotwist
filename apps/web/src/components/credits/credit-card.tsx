import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'

type CreditCardProps = {
  imagePath: string
  name: string
  role: string
}

export const CreditCard = ({ imagePath, name, role }: CreditCardProps) => {
  return (
    <li className="flex items-center gap-2 border-b border-dashed py-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
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
      </div>

      <div className="flex flex-1 justify-between">
        <span className="text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">{role}</span>
      </div>
    </li>
  )
}
