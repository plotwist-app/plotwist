'use client'

import { SUPPORTED_LANGUAGES } from 'languages'
import { MoonStar, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@plotwist/ui/components/ui/select'

import { useLanguage } from '@/context/language'
import type { Language } from '@/services/tmdb'
import { cn } from '@plotwist/ui/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'

export const HeaderNavigationDrawerConfigs = () => {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const { replace } = useRouter()
  const { language, dictionary } = useLanguage()

  const themes = ['light', 'system', 'dark'] as const

  const pathname = usePathname()

  const handleRedirectLanguageChange = (language: Language) => {
    const paramsArray = pathname.split('/')
    const newParamsArray = paramsArray.map((param, index) =>
      index === 1 ? language : param
    )

    const newPathname = newParamsArray.join('/')
    replace(newPathname)
  }

  const currentLanguageOption = SUPPORTED_LANGUAGES.find(
    lang => lang.value === language
  )

  return (
    <div>
      <div className="flex h-9 items-center justify-between p-2 text-sm">
        <span className="">{dictionary.theme}</span>

        <div className="-mr-1.5 flex rounded-full border">
          {themes.map((i, index) => {
            const isActive =
              i === theme ||
              (i === 'system' && theme === 'system' && resolvedTheme)

            return (
              <div
                className={cn(
                  'cursor-pointer rounded-full p-1 transition-all hover:text-foreground border-transparent text-muted-foreground first:border-r last:border-l',
                  isActive && 'border-border text-foreground',
                  index === 1 && '!border-x'
                )}
                onClick={() => setTheme(i)}
                onKeyDown={() => setTheme(i)}
                key={i}
              >
                {i === 'light' ? (
                  <Sun className="size-4" />
                ) : i === 'dark' ? (
                  <MoonStar className="size-4" />
                ) : (
                  <Monitor className="size-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-2 text-sm">
        <span className="">{dictionary.language}</span>

        <div>
          <Select
            onValueChange={value =>
              handleRedirectLanguageChange(value as Language)
            }
          >
            <SelectTrigger className="-mr-1 h-6 w-[150px]">
              <div>
                {currentLanguageOption && (
                  <ReactCountryFlag
                    countryCode={currentLanguageOption.country}
                    svg
                    className="mr-2"
                  />
                )}

                {currentLanguageOption?.label}
              </div>
            </SelectTrigger>

            <SelectContent>
              {SUPPORTED_LANGUAGES.map(({ value, country, label, enabled }) => (
                <SelectItem
                  key={value}
                  className={
                    value === language ? 'space-x-2 bg-muted' : 'space-x-2'
                  }
                  disabled={!enabled}
                  value={value}
                >
                  <ReactCountryFlag
                    countryCode={country}
                    svg
                    className="mr-2"
                  />

                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
