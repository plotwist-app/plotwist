import { SettingsDropdown } from '@/components/settings-dropdown'
import { SidebarNavigation } from '.'

import { User } from '@supabase/supabase-js'

type SidebarProps = {
  user: User | null
}

export const Sidebar = ({ user }: SidebarProps) => {
  const username: string = user?.user_metadata.username
  const initial = username[0].toUpperCase()

  return (
    <aside className="flex h-screen flex-col justify-between border-r p-4">
      <SidebarNavigation />

      <div className="flex  items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {initial}
          </div>

          <span className="text-sm">{username}</span>
        </div>

        <SettingsDropdown />
      </div>
    </aside>
  )
}
