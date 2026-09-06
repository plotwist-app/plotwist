'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { Switch } from '@plotwist/ui/components/ui/switch'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  parseUiVersion,
  serializeUiVersionCookie,
  type UiVersion,
} from '@/lib/ui-version'

type UiVersionControlProps = {
  initialVersion: UiVersion
  label: string
  experimentalLabel: string
  errorLabel: string
}

export const UiVersionControl = ({
  initialVersion,
  label,
  experimentalLabel,
  errorLabel,
}: UiVersionControlProps) => {
  const router = useRouter()
  const [version, setVersion] = useState(() =>
    parseUiVersion(initialVersion)
  )
  const [error, setError] = useState<string | null>(null)

  const handleCheckedChange = (checked: boolean) => {
    const previousVersion = version
    const nextVersion: UiVersion = checked ? 'cinematic' : 'classic'

    setError(null)

    try {
      document.cookie = serializeUiVersionCookie(nextVersion)
      setVersion(nextVersion)
      router.refresh()
    } catch {
      setVersion(previousVersion)
      setError(errorLabel)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between p-2 text-sm">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          <Badge variant="secondary">{experimentalLabel}</Badge>
        </div>
        <Switch
          aria-label={label}
          checked={version === 'cinematic'}
          onCheckedChange={handleCheckedChange}
        />
      </div>
      {error && (
        <p className="px-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
