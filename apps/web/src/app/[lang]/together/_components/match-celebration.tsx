'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'
import type { TogetherMatch } from '@/services/together'

type MatchCelebrationCopy = {
  heading: string
  interestSummary: string
  continueDiscovering: string
  viewMatches: string
}

type MatchCelebrationProps = {
  match: TogetherMatch
  onContinue: () => void
  onViewMatches: () => void
  copy: MatchCelebrationCopy
}

export function MatchCelebration({
  match,
  onContinue,
  onViewMatches,
  copy,
}: MatchCelebrationProps) {
  const interestCount = match.likeCount + (match.maybeCount ?? 0)
  const interestSummary = copy.interestSummary
    .replace('{count}', String(interestCount))
    .replace('{percent}', String(match.matchPercent))

  return (
    <Dialog open onOpenChange={open => !open && onContinue()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm gap-0 overflow-hidden rounded-3xl border-[#2c2924] bg-[#0b0b09] p-0 font-sans text-[#f7f3ea] shadow-2xl [&>button]:text-[#f7f3ea] [&>button]:ring-offset-[#0b0b09] [&>button]:hover:bg-[#2c2924] [&>button]:focus:ring-[#ff8b84] [&>button]:focus:ring-offset-[#0b0b09] [&>button[data-state=open]]:bg-[#161513]">
        <div className="bg-[#ff645a] px-6 py-3 text-white">
          <DialogTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
            {copy.heading}
          </DialogTitle>
        </div>
        <div className="px-6 py-7">
          <h2 className="text-3xl font-semibold leading-none tracking-[-0.035em] text-[#f7f3ea]">
            {match.title}
          </h2>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-[rgba(247,243,234,0.68)]">
            {interestSummary}
          </DialogDescription>

          <div className="mt-7 grid gap-3">
            <button
              type="button"
              className="h-12 rounded-xl bg-[#ff645a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#ef5349] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8b84] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b09]"
              onClick={onViewMatches}
            >
              {copy.viewMatches}
            </button>
            <button
              type="button"
              className="h-12 rounded-xl border border-[#34312c] bg-[#161513] px-4 text-sm font-medium text-[#f7f3ea] transition-colors hover:bg-[#1c1a16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8b84] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b09]"
              onClick={onContinue}
            >
              {copy.continueDiscovering}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
