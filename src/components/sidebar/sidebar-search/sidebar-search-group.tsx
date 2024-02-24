import { ReactNode } from 'react'

type SidebarSearchGroupProps = {
  heading: string
  children: ReactNode
}

export const SidebarSearchGroup = ({
  children,
  heading,
}: SidebarSearchGroupProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-muted-foreground">{heading}</h4>
      {children}
    </div>
  )
}
