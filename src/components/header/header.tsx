import { CommandSearch } from '../command-search'
import { SettingsDropdown } from '../settings-dropdown'
import { HeaderNavigationMenu } from './header-navigation-menu'

export const Header = () => {
  return (
    <header className="flex justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">[TMDB]</h1>

        <HeaderNavigationMenu />
      </div>

      <div className="flex gap-2">
        <CommandSearch />

        <div>
          <SettingsDropdown />
        </div>
      </div>
    </header>
  )
}
