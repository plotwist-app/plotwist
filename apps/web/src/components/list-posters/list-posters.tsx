import { ListItem } from '@/types/supabase/lists'
import { Poster } from '../poster'
import { cn } from '@/lib/utils'

type ListPostersProps = {
  listItems: ListItem[]
}

export const ListPosters = ({ listItems }: ListPostersProps) => {
  return (
    <div className="flex overflow-hidden">
      {listItems.slice(0, 5).map((item, index) => {
        return (
          <Poster
            url={item.poster_path}
            key={item.id}
            alt={item.title}
            className={cn('w-full shadow-2xl', index > 0 && '-ml-20')}
            style={{
              zIndex: `${50 - index}`,
            }}
          />
        )
      })}

      {Array.from({ length: 5 - listItems.length }).map((_, index) => (
        <div
          key={index}
          className={cn(
            '-ml-20 aspect-poster w-full rounded-lg border-[1.5px] border-dashed bg-card shadow-md',
            listItems.length === 0 && index === 0 && '-ml-0',
          )}
          style={{
            zIndex: `${40 - index}`,
          }}
        />
      ))}
    </div>
  )
}
