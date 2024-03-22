import Image from 'next/image'

type PosterProps = {
  url: string
  alt: string
}

export const Poster = ({ url, alt }: PosterProps) => {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border bg-muted shadow">
      <Image
        fill
        className="object-cover"
        src={url}
        alt={alt}
        loading="lazy"
        sizes="100%"
      />
    </div>
  )
}
