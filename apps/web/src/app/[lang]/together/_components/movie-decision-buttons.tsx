'use client'

type MovieDecision = 'nope' | 'maybe' | 'yes'

type MovieDecisionButtonsProps = {
  disabled?: boolean
  labels: {
    nope: string
    maybe: string
    yes: string
  }
  onDecide: (decision: MovieDecision) => void
}

export function MovieDecisionButtons({
  disabled,
  labels,
  onDecide,
}: MovieDecisionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDecide('nope')}
        className="together-btn-secondary together-meta h-14 rounded-full transition-transform active:scale-[0.97] disabled:opacity-50"
      >
        {labels.nope}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDecide('maybe')}
        className="together-btn-maybe together-meta h-14 rounded-full transition-transform active:scale-[0.97] disabled:opacity-50"
      >
        {labels.maybe}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDecide('yes')}
        className="together-btn-primary together-meta h-14 rounded-full transition-transform active:scale-[0.97] disabled:opacity-50"
      >
        {labels.yes}
      </button>
    </div>
  )
}
