'use client'

import { PrimaryButton } from './primary-button'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'

type WaitingRoomProps = {
  names: string[]
  ready: boolean
  copy: {
    night_for_two: string
    waiting_title: string
    waiting_body: string
    start_choosing: string
    you: string
    empty_seat: string
  }
  meId?: string
  participantIds: string[]
  onStart: () => void
}

export function WaitingRoom({
  names,
  ready,
  copy,
  meId,
  participantIds,
  onStart,
}: WaitingRoomProps) {
  const first = names[0]
  const second = names[1]
  const pairTitle =
    ready && first && second ? `${first} & ${second}` : copy.waiting_title

  return (
    <TogetherShell>
      <TogetherMark />
      <p className="together-kicker together-fg-accent mt-6">
        {copy.night_for_two}
      </p>
      <h1 className="together-display mt-3">{pairTitle}</h1>
      {!ready && (
        <p className="together-body together-fg-muted mt-3">
          {copy.waiting_body}
        </p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-3">
        {[first, second].map((name, index) => {
          const filled = Boolean(name)
          return (
            <div
              key={participantIds[index] ?? `seat-${index}`}
              className={`rounded-[1.5rem] px-4 py-6 text-center ${
                filled
                  ? 'together-surface'
                  : 'together-empty-seat together-dashed bg-transparent'
              }`}
            >
              <div
                className={`together-title mx-auto flex size-14 items-center justify-center rounded-full ${
                  filled
                    ? 'together-btn-primary'
                    : 'together-fg-subtle together-dashed'
                }`}
              >
                {filled ? name?.slice(0, 1).toUpperCase() : '?'}
              </div>
              <p className="together-label mt-3 truncate">
                {name ?? copy.empty_seat}
              </p>
              {participantIds[index] === meId && (
                <p className="together-meta together-fg-subtle mt-1">
                  {copy.you}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {ready && (
        <PrimaryButton className="mt-10" onClick={onStart}>
          {copy.start_choosing}
        </PrimaryButton>
      )}
    </TogetherShell>
  )
}
