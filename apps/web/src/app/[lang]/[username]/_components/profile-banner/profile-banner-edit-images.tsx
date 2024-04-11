import { useQuery } from '@tanstack/react-query'
import { SelectedItem } from './profile-banner-edit'
import { tmdb } from '@plotwist/tmdb'
import { ImagesMasonry, ReactMasonrySkeleton } from '@/components/images'

type ProfileBannerEditImagesProps = { selectedItem: SelectedItem }
export const ProfileBannerEditImages = ({
  selectedItem,
}: ProfileBannerEditImagesProps) => {
  const { id, type } = selectedItem

  const { data, isLoading } = useQuery({
    queryKey: ['images', id],
    queryFn: async () => await tmdb.images(type, id),
  })

  if (!data || isLoading) return <ReactMasonrySkeleton count={10} />

  const images = () => {
    return [...data.backdrops, ...data.posters].sort(
      (a, b) => b.vote_count - a.vote_count,
    )
  }

  return <ImagesMasonry images={images()} />
}
