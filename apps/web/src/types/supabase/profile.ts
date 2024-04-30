export type Profile = {
  id: string
  email: string
  username: string
  created_at: string
  subscription_type: 'PRO' | 'MEMBER'
  banner_path: string | null
  image_path: string | null
}
