import Image from 'next/image'
import Link from 'next/link'

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
  const src = `https://image.tmdb.org/t/p/w500/${imagePath}`

  return (
    <Link
      className="flex flex-col space-x-2 overflow-hidden rounded-md  border bg-muted shadow"
      href={href}
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-background/50">
        {imagePath ? (
          <Image
            loading="lazy"
            src={src}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="select-none text-2xl">{name[0]}</span>
        )}
      </div>

      <div className="flex flex-col space-y-0 py-2">
        <span className="text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">
          as {role || 'Unknown'}
        </span>
      </div>
    </Link>
  )
}
