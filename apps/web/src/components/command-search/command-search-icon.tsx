import { detectOperatingSystem } from '@/utils/operating-system'
import { CommandIcon } from 'lucide-react'

export const CommandSearchIcon = () => {
  const system = detectOperatingSystem()

  if (system === 'iOS') return <></>
  if (system === 'Mac OS')
    return (
      <div className="mobile:hidden flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
        <CommandIcon size={12} />K
      </div>
    )

  return (
    <div className="mobile:hidden flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
      CTRL + K
    </div>
  )
}
