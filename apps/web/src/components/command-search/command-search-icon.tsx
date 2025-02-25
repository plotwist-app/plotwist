import { CommandIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { detectOperatingSystem } from '@/utils/operating-system'

export const CommandSearchIcon = () => {
  const [shortcut, setShortcut] = useState<React.ReactNode>(null)
  
  useEffect(() => {
    const system = detectOperatingSystem()

    if (system === 'iOS') {
      setShortcut(null)
    } else if (system === 'Mac OS') {
      setShortcut(
        <div className="hidden lg:flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <CommandIcon size={12} />K
        </div>
      )
    } else {
      setShortcut(
        <div className="hidden lg:flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          CTRL + K
        </div>
      )
    }
  }, [])
  
  return shortcut
}
