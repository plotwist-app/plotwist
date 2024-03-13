import { WatchRegion, WatchProvidersField } from './(fields)'

export const WhereToWatch = () => {
  return (
    <div className="space-y-4">
      <WatchRegion />
      <WatchProvidersField />
    </div>
  )
}
