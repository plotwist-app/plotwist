import Image from 'next/image'
import { TopRatedTvShowResult } from 'tmdb-ts'

type TvShowCardProps = {
  tvShow: TopRatedTvShowResult
}

export const TvShowCard = ({ tvShow }: TvShowCardProps) => {
  const { name, poster_path: poster } = tvShow

  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] w-full relative overflow-hidden rounded-sm">
        <Image
          fill
          className="object-cover"
          src={`https://image.tmdb.org/t/p/original/${poster}`}
          alt={name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="">
        <span>{name}</span>
      </div>
    </div>
  )
}
