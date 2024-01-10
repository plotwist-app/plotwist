import { LastReviews } from './components/last-reviews'

const AppPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">description about dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr,250px]">
        <div className="space-y-4">
          <LastReviews />
        </div>
        <div>popular</div>
      </div>
    </div>
  )
}

export default AppPage
