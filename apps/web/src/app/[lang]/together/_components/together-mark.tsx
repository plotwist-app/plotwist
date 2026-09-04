export function TogetherMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`} aria-hidden>
      <span className="size-3.5 rounded-full bg-[var(--tg-accent)]" />
      <span className="-ml-1.5 size-3.5 rounded-full border-2 border-[var(--tg-accent)] bg-[var(--tg-bg)]" />
    </div>
  )
}
