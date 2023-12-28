import { Lists } from './components/lists'

const ListsPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lists</h1>

          <p className="text-muted-foreground">
            Create watch-lists to manage your movies and tv shows.
          </p>
        </div>
      </div>

      <Lists />
    </div>
  )
}

export default ListsPage
