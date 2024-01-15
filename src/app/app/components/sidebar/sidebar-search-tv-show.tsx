import Link from 'next/link'
import { TVWithMediaType } from 'tmdb-ts'

type SidebarSearchTvShowProps = {
  tvShow: TVWithMediaType
}

export const SidebarSearchTvShow = ({ tvShow }: SidebarSearchTvShowProps) => {
  return (
    <Link
      className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 hover:bg-muted"
      href={`/app/tv-shows/${tvShow.id}`}
    >
      <span className="text-md truncate whitespace-nowrap">{tvShow.name}</span>

      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {new Date(tvShow.first_air_date).getFullYear()}
      </span>
    </Link>
  )
}
