'use client'

import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { PersonCard, PersonCardSkeleton } from '@/components/person-card'
import { useLanguage } from '@/context/language'
import { tmdb } from '@/services/tmdb'

const INITIAL_PAGE = 1
const MAX_PAGE = 500

export const PeopleList = () => {
  const { language } = useLanguage()
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['people-list', language],
    queryFn: async ({ pageParam }) =>
      await tmdb.person.popular({
        language,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.page + 1,
    initialPageParam: INITIAL_PAGE,
  })

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data)
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <PersonCardSkeleton key={index} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap((page) => page.results)

  const currentPage = data.pages[data.pages.length - 1]
  const isLastPage =
    currentPage.page >= currentPage.total_pages || currentPage.page === MAX_PAGE

  return (
    <div className="relative grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-6">
      {flatData.map((person) => (
        <PersonCard person={person} key={person.id} language={language} />
      ))}

      {!isLastPage &&
        Array.from({ length: 6 }).map((_, index) => (
          <PersonCardSkeleton key={index} ref={index === 0 ? ref : undefined} />
        ))}
    </div>
  )
}
