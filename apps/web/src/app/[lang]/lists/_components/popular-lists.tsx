'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useLanguage } from '@/context/language'
import { fetchPopularLists } from '@/services/api/lists/fetch-popular-lists'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

export const PopularLists = () => {
  const { language } = useLanguage()
  const { data } = useQuery({
    queryKey: ['popular-lists'],
    queryFn: fetchPopularLists,
  })

  if (!data) return <></>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Popular lists</h2>

      <li className="flex flex-col gap-4">
        {data.map((list) => (
          <Link
            href={`/${language}/lists/${list.id}`}
            key={list.id}
            className="grid grid-cols-5 gap-4"
          >
            <div className="relative col-span-2 aspect-video overflow-hidden rounded-lg border bg-muted">
              {list.cover_path && (
                <Image fill src={tmdbImage(list.cover_path)} alt="" />
              )}
            </div>

            <div className="col-span-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={`/${language}/${list.profiles.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8 text-xs">
                    <AvatarFallback>{list.profiles.username[0]}</AvatarFallback>
                  </Avatar>

                  <span className="text-sm text-muted-foreground">
                    {list.profiles.username}
                  </span>
                </Link>

                <div
                  className={'rounded-full border bg-muted px-3 py-1 text-xs'}
                >
                  <div>
                    ❤ <span className="ml-1">0</span>
                  </div>

                  <div>
                    <span className="ml-1">0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="text-lg font-bold">{list.name}</h5>

                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {list.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </li>
    </div>
  )
}
