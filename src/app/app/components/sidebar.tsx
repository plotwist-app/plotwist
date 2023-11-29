import { SettingsDropdown } from '@/components/settings-dropdown'
import { SidebarNavigation } from './sidebar-navigation'

export const Sidebar = () => {
  return (
    <aside className="flex h-screen flex-col justify-between border-r p-4">
      <SidebarNavigation />

      <div className="flex  items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            L
          </div>

          <span className="text-sm">Luiz Henrique</span>
        </div>

        <SettingsDropdown />
      </div>
    </aside>
  )
}
