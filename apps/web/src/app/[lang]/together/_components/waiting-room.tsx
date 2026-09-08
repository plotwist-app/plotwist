'use client'

import { PrimaryButton } from './primary-button'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'

type WaitingRoomProps = {
  names: string[]
  ready: boolean
  maxParticipants: number
  copy: {
    group_kicker: string
    waiting_title: string
    waiting_body: string
    ready_title: string
    start_choosing: string
    you: string
    empty_seat: string
    room_capacity: string
  }
  meId?: string
  participantIds: string[]
  onStart: () => void
}

export function WaitingRoom({
  names,
  ready,
  maxParticipants,
  copy,
  meId,
  participantIds,
  onStart,
}: WaitingRoomProps) {
  const heading = ready ? copy.ready_title : copy.waiting_title
  const capacity = copy.room_capacity
    .replace('{current}', String(names.length))
    .replace('{max}', String(maxParticipants))
  const seats = Array.from(
    { length: maxParticipants },
    (_, index) => names[index]
  )

  return (
    <TogetherShell>
      <TogetherMark />
      <p className="together-kicker together-fg-accent mt-6">
        {copy.group_kicker}
      </p>
      <h1 className="together-display mt-3">{heading}</h1>
      <p className="together-meta together-fg-muted mt-3">{capacity}</p>
      {!ready && (
        <p className="together-body together-fg-muted mt-3">
          {copy.waiting_body}
        </p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-3">
        {seats.map((name, index) => {
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
