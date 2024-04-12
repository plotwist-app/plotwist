import { supabase } from '@/services/supabase'

type UpdateProfileBannerPathValues = {
  username: string
  newBannerPath: string
}

export const updateProfileBannerPath = async ({
  username,
  newBannerPath,
}: UpdateProfileBannerPathValues) => {
  const { data } = await supabase
    .from('profiles')
    .update({ banner_path: newBannerPath })
    .eq('username', username)

  return data
}
