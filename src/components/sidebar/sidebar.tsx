import { SettingsDropdown } from '@/components/settings-dropdown'
import { SidebarNavigation } from './sidebar-navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '../ui/button'
import { Menu } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer'

type SidebarProps = {
  user: User | null
}

export const Sidebar = ({ user }: SidebarProps) => {
  const username: string = user?.user_metadata.username
  const initial = username[0].toUpperCase()

  const content = (
    <>
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
    </>
  )
  return (
    <>
      <div className="flex items-center justify-between border-b p-4 lg:hidden">
        <h1 className="text-xl font-semibold">[TMDB]</h1>

        <Drawer>
          <DrawerTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu />
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <div className="flex flex-col gap-4 p-4">{content}</div>
          </DrawerContent>
        </Drawer>
      </div>

      <aside className="hidden h-screen flex-col justify-between border-r p-4 lg:flex">
        {content}
      </aside>
    </>
  )
}
