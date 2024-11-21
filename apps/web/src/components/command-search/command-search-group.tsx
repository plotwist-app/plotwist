import type { ReactNode } from 'react'

type CommandSearchGroupProps = {
  heading: string
  children: ReactNode
}

export const CommandSearchGroup = ({
  children,
  heading,
}: CommandSearchGroupProps) => {
  return (
    <div className="space-y-2 p-4">
      <h4 className="text-sm font-bold">{heading}</h4>

      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
