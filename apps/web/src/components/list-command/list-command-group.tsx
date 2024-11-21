import type { PropsWithChildren } from 'react'

const Root = (props: PropsWithChildren) => (
  <div className="space-y-2 p-4" {...props} />
)

const Label = (props: PropsWithChildren) => (
  <h2 className="text-sm font-bold" {...props} />
)

const Items = (props: PropsWithChildren) => (
  <h2 className="space-y-1" {...props} />
)

export const ListCommandGroup = {
  Root,
  Label,
  Items,
}
