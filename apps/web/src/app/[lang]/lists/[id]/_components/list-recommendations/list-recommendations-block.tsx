import { ProBadge } from '@/components/pro-badge'

export const ListRecommendationsBlock = () => {
  return (
    <div className="absolute z-20 flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed bg-black/70 backdrop-blur-[1.5px] dark:bg-black/80">
      <p className="w-1/2 text-center text-sm text-white">
        Torne-se <ProBadge /> para sugestões exclusivas.
      </p>
    </div>
  )
}
