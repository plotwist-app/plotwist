import { detectOperatingSystem } from '@/utils/operating-system'
import { CommandIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export const CommandSearchIcon = () => {
  const [os, setOS] = useState<string | undefined>(undefined)

  useEffect(() => {
    setOS(detectOperatingSystem())
  }, [])

  if (!os || os === 'iOS') {
    return null
  }

  if (os === 'Mac OS') {
    return (
      <div className="hidden lg:flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
        <CommandIcon size={12} />K
      </div>
    )
  }

  return (
    <div className="hidden lg:flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
      CTRL + K
    </div>
  )
}
