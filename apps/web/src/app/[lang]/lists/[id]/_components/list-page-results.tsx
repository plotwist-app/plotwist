import type { Dictionary } from '@/utils/dictionaries'
import Link from 'next/link'

export type ListPageEmptyResultsProps = { dictionary: Dictionary }
export const ListPageEmptyResults = ({
  dictionary,
}: ListPageEmptyResultsProps) => {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {dictionary.list_page.list_not_found}
          </h1>

          <p className="text-muted-foreground">
            {dictionary.list_page.see_your_lists_or_create_new}{' '}
            <Link href="/lists" className="underline">
              {dictionary.list_page.here}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
