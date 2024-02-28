import { SettingsDropdown } from '../settings-dropdown'

export const Header = () => {
  return (
    <header className="flex justify-between">
      <nav>
        <div className="flex items-end gap-1">
          <h1 className="text-3xl font-semibold">[TMDB]</h1>
          <span className="mb-1 text-xs">Front end</span>
        </div>
      </nav>

      <div className="flex gap-2">
        <SettingsDropdown />
      </div>
    </header>
  )
}
