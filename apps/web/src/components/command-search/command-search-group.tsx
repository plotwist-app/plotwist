import { ReactNode } from 'react'

type CommandSearchGroupProps = {
  heading: string
  children: ReactNode
}

export const CommandSearchGroup = ({
  children,
  heading,
}: CommandSearchGroupProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-muted-foreground">{heading}</h4>
      {children}
    </div>
  )
}
