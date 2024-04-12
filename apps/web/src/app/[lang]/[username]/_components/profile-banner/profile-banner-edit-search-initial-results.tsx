import { useLanguage } from '@/context/language'
import { tmdb } from '@plotwist/tmdb'
import { useQuery } from '@tanstack/react-query'
import { ProfileBannerEditItem } from './profile-banner-edit-item'
import { tmdbImage } from '@/utils/tmdb/image'
import { SelectedItem } from './profile-banner-edit'

type ProfileBannerEditInitialProps = {
  onSelect: (selectedItem: SelectedItem) => void
}

export const ProfileBannerEditSearchInitialResults = ({
  onSelect,
}: ProfileBannerEditInitialProps) => {
  const { language } = useLanguage()

  const { data } = useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: async () =>
      await tmdb.movies.list({ language, list: 'top_rated', page: 1 }),
  })

  return (
    <div className="flex flex-col gap-4">
      {data?.results.map((movie) => (
        <ProfileBannerEditItem.Root
          key={movie.id}
          onClick={() =>
            onSelect({ id: movie.id, type: 'movie', title: movie.title })
          }
        >
          {movie.backdrop_path && (
            <ProfileBannerEditItem.Image src={tmdbImage(movie.backdrop_path)} />
          )}

          <ProfileBannerEditItem.Title>
            {movie.title}
          </ProfileBannerEditItem.Title>
        </ProfileBannerEditItem.Root>
      ))}
    </div>
  )
}
