'use client'

import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'
import Link from 'next/link'

export const ListRecommendationsBlock = () => {
  const { dictionary, language } = useLanguage()

  return (
    <Link
      href={`/${language}/pricing`}
      className="absolute z-30 flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed bg-black/70 backdrop-blur-[1.5px] dark:bg-black/80"
    >
      <p className="w-2/3 text-center text-sm text-white">
        {dictionary.list_recommendations.block.first_line} <ProBadge />{' '}
        {dictionary.list_recommendations.block.second_line}
      </p>
    </Link>
  )
}
