import { Search, X } from 'lucide-react'
import { LOCAL_STORAGE_KEY } from './command-search'
import { useEffect, useState } from 'react'

export const handleAddHistory = (search: string) => {
  const previousHistory = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (previousHistory) {
    const parsedHistory = JSON.parse(previousHistory) as string[]

    if (parsedHistory.includes(search)) {
      const newHistory = [search, ...parsedHistory.filter((i) => i !== search)]

      return localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory))
    }

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([search, ...parsedHistory]),
    )

    return
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([search]))
}

const MAX_RESULTS = 5

type CommandSearchHistoryProps = { search: string }
export const CommandSearchHistory = ({ search }: CommandSearchHistoryProps) => {
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    const localStorageResults = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (localStorageResults) {
      console.log({ localStorageResults })
      setResults(JSON.parse(localStorageResults) as string[])
    }
  }, [search])

  const handleDeleteHistoryItem = (item: string) => {
    const previousHistory = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (previousHistory) {
      const parsedHistory = JSON.parse(previousHistory) as string[]
      const newHistory = parsedHistory.filter((i) => i !== item)

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory))
      setResults(newHistory)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 px-2 pt-2">
      {results.slice(0, MAX_RESULTS).map((item) => (
        <div
          className="group flex items-center rounded-sm border border-dashed px-2 py-1 text-sm text-muted-foreground transition"
          role="button"
          key={item}
        >
          <Search className="mr-1 size-3.5" />
          {item}

          <div
            className="ml-3 flex size-4 items-center justify-center rounded-full bg-muted p-0.5"
            onClick={() => handleDeleteHistoryItem(item)}
          >
            <X className="size-" />
          </div>
        </div>
      ))}
    </div>
  )
}
