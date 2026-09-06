import { ItemReview } from '@/components/item-review'
import { ItemStatus } from '@/components/item-status'
import { ListsDropdown } from '@/components/lists'
import { SharePageButton } from '@/components/share-page-button'
import { cn } from '@/lib/utils'
import type { Language, MovieDetails } from '@/services/tmdb'

type MovieActionsProps = {
  movie: MovieDetails
  language: Language
  className?: string
}

export const MovieActions = ({
  movie,
  language,
  className,
}: MovieActionsProps) => (
  <div className={cn('flex flex-wrap items-center gap-1', className)}>
    <ListsDropdown item={movie} />
    <ItemReview />
    <ItemStatus mediaType="MOVIE" tmdbId={movie.id} />
    <SharePageButton language={language} path={`movies/${movie.id}`} />
  </div>
)
