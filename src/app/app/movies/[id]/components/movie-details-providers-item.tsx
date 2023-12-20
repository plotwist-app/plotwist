import Image from 'next/image'
import { Buy, Rent } from 'tmdb-ts'

type MovieDetailsProviderItemProps = { item: Buy | Rent }

export const MovieDetailsProviderItem = ({
  item,
}: MovieDetailsProviderItemProps) => {
  const src = `https://image.tmdb.org/t/p/original/${item.logo_path}`

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative aspect-square h-6 w-6 overflow-hidden rounded-lg"
        key={item.provider_id}
      >
        <Image
          className="aspect-square w-full"
          src={src}
          loading="lazy"
          alt={item.provider_name}
          fill
        />
      </div>

      <span className="text-xs">{item.provider_name}</span>
    </div>
  )
}
