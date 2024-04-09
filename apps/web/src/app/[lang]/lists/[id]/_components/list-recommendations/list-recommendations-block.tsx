'use client'

import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'

export const ListRecommendationsBlock = () => {
  const { dictionary } = useLanguage()

  return (
    <div className="absolute z-20 flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed bg-black/70 backdrop-blur-[1.5px] dark:bg-black/80">
      <p className="w-1/2 text-center text-sm text-white">
        {dictionary.list_recommendations.block.first_line} <ProBadge />{' '}
        {dictionary.list_recommendations.block.second_line}
      </p>
    </div>
  )
}
