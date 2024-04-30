import { supabase } from '@/services/supabase'

type UpdateProfileImagePathValues = {
  username: string
  newImagePath: string
}

export const updateProfileImagePath = async ({
  username,
  newImagePath,
}: UpdateProfileImagePathValues) => {
  const { data } = await supabase
    .from('profiles')
    .update({ image_path: newImagePath })
    .eq('username', username)

  return data
}
