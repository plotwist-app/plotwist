import { useQuery } from '@tanstack/react-query'
import { SelectedItem } from './profile-banner-edit'
import { tmdb } from '@plotwist/tmdb'
import { ImagesMasonry, ReactMasonrySkeleton } from '@/components/images'
import { useProfile } from '@/hooks/use-profile'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'

type ProfileBannerEditImagesProps = {
  selectedItem: SelectedItem
  handleCloseDialog: () => void
}
export const ProfileBannerEditImages = ({
  selectedItem,
  handleCloseDialog,
}: ProfileBannerEditImagesProps) => {
  const { id, type } = selectedItem

  const { dictionary } = useLanguage()
  const { data, isLoading } = useQuery({
    queryKey: ['images', id],
    queryFn: async () => await tmdb.images(type, id),
  })

  const { username } = useParams()

  const { handleUpdateBannerPath } = useProfile()

  if (!data || isLoading) return <ReactMasonrySkeleton count={20} />

  const images = () => {
    return [...data.backdrops, ...data.posters].sort(
      (a, b) => b.vote_count - a.vote_count,
    )
  }

  return (
    <ImagesMasonry
      images={images()}
      onSelect={(image) =>
        handleUpdateBannerPath.mutate(
          {
            newBannerPath: image.file_path,
            username: String(username),
          },
          {
            onSettled: () => {
              handleCloseDialog()
              toast.success(dictionary.profile_banner.changed_successfully)
            },
          },
        )
      }
    />
  )
}
