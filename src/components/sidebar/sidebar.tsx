import { SettingsDropdown } from '@/components/settings-dropdown'
import { SidebarNavigation } from './sidebar-navigation'
import { User } from '@supabase/supabase-js'

import { SidebarDrawer } from './sidebar-drawer'

type SidebarProps = {
  user: User | null
}

export const Sidebar = ({ user }: SidebarProps) => {
  const content = (
    <>
      <SidebarNavigation />

      <div className="flex  items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {user && (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {user.user_metadata?.username?.toUpperCase()}
              </div>
              <span className="text-sm">{user.user_metadata?.username}</span>
            </>
          )}
        </div>

        <SettingsDropdown />
      </div>
    </>
  )

  return (
    <>
      <div className="flex items-center justify-between border-b p-4 lg:hidden">
        <h1 className="text-xl font-semibold">[TMDB]</h1>
        <SidebarDrawer>{content}</SidebarDrawer>
      </div>

      <aside className="hidden h-screen flex-col justify-between border-r p-4 lg:flex">
        {content}
      </aside>
    </>
  )
}
