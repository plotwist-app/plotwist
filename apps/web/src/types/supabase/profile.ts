export type Profile = {
  id: string
  email: string
  username: string
  created_at: string
  subscription_type: 'PRO' | 'FREE'
  banner_path: string | null
}
