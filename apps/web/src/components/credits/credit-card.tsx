import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'

type CreditCardProps = {
  imagePath: string
  name: string
  role: string
}

export const CreditCard = ({ imagePath, name, role }: CreditCardProps) => {
  return (
    <div className="flex flex-col space-x-2 overflow-hidden rounded-md border bg-muted shadow">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-background/50">
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
          <span className="select-none text-2xl">{name[0]}</span>
        )}
      </div>

      <div className="flex flex-col space-y-0 py-2">
        <span className="text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">{role}</span>
      </div>
    </div>
  )
}
