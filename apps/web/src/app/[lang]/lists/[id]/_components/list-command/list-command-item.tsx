import { Button } from '@plotwist/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@plotwist/ui/components/ui/dropdown-menu'
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

export const ListCommandItem = {
  Root,
  Label,
  Year,
  Dropdown,
}
