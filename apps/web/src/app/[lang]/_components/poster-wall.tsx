import Image from 'next/image'

type Poster = { src: string; alt: string }

function PosterRow({
  posters,
  direction,
  duration,
}: {
  posters: Poster[]
  direction: 'left' | 'right'
  duration: number
}) {
  const items = [...posters, ...posters]

  return (
    <div
      className="flex gap-3"
      style={{
        animation: `marquee-${direction} ${duration}s linear infinite`,
        width: 'max-content',
      }}
    >
      {items.map((poster, i) => (
        <div
          key={`${poster.alt}-${i}`}
          className="relative shrink-0 w-24 sm:w-28 md:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-muted"
        >
          <Image
            src={poster.src}
            alt={poster.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
          />
        </div>
      ))}
    </div>
  )
}

type PosterWallProps = {
  posters: Poster[]
}

export function PosterWall({ posters }: PosterWallProps) {
  if (posters.length < 10) return null

  const mid = Math.ceil(posters.length / 2)
  const row1 = posters.slice(0, mid)
  const row2 = posters.slice(mid)

  return (
    <>
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped keyframes for marquee animation
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee-left {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes marquee-right {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
          `,
        }}
      />

      <section
        className="relative overflow-hidden py-4 md:py-8"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <PosterRow posters={row1} direction="left" duration={60} />
          <PosterRow posters={row2} direction="right" duration={50} />
        </div>
      </section>
    </>
  )
}
