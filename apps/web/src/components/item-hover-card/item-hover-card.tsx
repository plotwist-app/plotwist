import { PropsWithChildren } from 'react'

const Banner = (props: PropsWithChildren) => {
  return (
    <figure
      className="relative aspect-video overflow-hidden bg-muted dark:bg-muted/25"
      {...props}
    />
  )
}

const Information = (props: PropsWithChildren) => {
  return <div className="flex gap-2 p-4" {...props} />
}

const Poster = (props: PropsWithChildren) => {
  return (
    <div className="w-1/3">
      <figure
        className="relative -mt-12 aspect-[2/3]  overflow-hidden rounded-lg border bg-muted shadow"
        {...props}
      />
    </div>
  )
}

const Summary = (props: PropsWithChildren) => {
  return <div className="w-2/3 space-y-1" {...props} />
}

const Title = (props: PropsWithChildren) => {
  return <span className="text-sm font-bold" {...props} />
}

const Overview = (props: PropsWithChildren) => {
  return (
    <span className="line-clamp-3 text-xs text-muted-foreground" {...props} />
  )
}

export const ItemHoverCard = {
  Banner,
  Information,
  Poster,
  Summary,
  Title,
  Overview,
}
