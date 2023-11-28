import { ThemeToggle } from './theme-toggle'

export const Header = () => {
  return (
    <header className="flex justify-between">
      <nav>
        <div className="flex gap-1 items-end">
          <h1 className="text-3xl font-semibold">TMDB</h1>
          <span className="text-xs mb-1">Front end</span>
        </div>
      </nav>

      <div className="flex gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
