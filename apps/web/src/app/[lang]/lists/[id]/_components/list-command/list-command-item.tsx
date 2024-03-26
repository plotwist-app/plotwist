'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@plotwist/ui'

import { MoreVertical } from 'lucide-react'
import { PropsWithChildren } from 'react'

const Root = (props: PropsWithChildren) => {
  return (
    <div
      className="flex justify-between gap-4 rounded-lg p-2 hover:bg-muted/50"
      {...props}
    />
  )
}

const Label = (props: PropsWithChildren) => {
  return <span className="flex items-center text-sm font-normal" {...props} />
}

const Year = (props: PropsWithChildren) => {
  return (
    <span
      className="ml-1 flex items-center gap-1 text-xs text-muted-foreground"
      {...props}
    />
  )
}

const Dropdown = ({ children }: PropsWithChildren) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="outline" className="h-5 w-5">
          <MoreVertical size={12} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

const Banner = (props: PropsWithChildren) => {
  return (
    <figure
      className="relative aspect-video overflow-hidden bg-muted"
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

export const ListCommandItem = {
  Root,
  Label,
  Year,
  Dropdown,
  Banner,
  Information,
  Poster,
  Summary,
  Title,
  Overview,
}
