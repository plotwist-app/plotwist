'use client'

import { SUPPORTED_LANGUAGES } from 'languages'
import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { twMerge } from 'tailwind-merge'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { usePathname, useRouter } from 'next/navigation'
import { Language } from '@plotwist/tmdb'
import ReactCountryFlag from 'react-country-flag'

export const HeaderNavigationDrawerConfigs = () => {
  const { setTheme, theme } = useTheme()
  const { replace } = useRouter()

  const themes = ['light', 'dark'] as const

  const pathname = usePathname()
  const currentLanguage = pathname.split('/')[1]

  const handleRedirectLanguageChange = (language: Language) => {
    const paramsArray = pathname.split('/')
    const newParamsArray = paramsArray.map((param, index) =>
      index === 1 ? language : param,
    )

    const newPathname = newParamsArray.join('/')
    replace(newPathname)
  }

  const currentLanguageOption = SUPPORTED_LANGUAGES.find(
    (lang) => lang.value === currentLanguage,
  )

  return (
    <div>
      <div className="flex h-9 items-center justify-between p-2 text-sm font-medium">
        <span className="text-muted-foreground">Theme</span>

        <div className="-mr-1.5 flex rounded-full border">
          {themes.map((i) => {
            const isActive = theme === i

            return (
              <div
                className={twMerge(
                  'hover:t cursor-pointer rounded-full p-1 text-muted-foreground transition-all hover:text-foreground',
                  isActive &&
                    'border-x text-foreground first:border-r last:border-l',
                )}
                onClick={() => setTheme(i)}
                key={i}
              >
                {i === 'light' ? (
                  <MoonStar className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-2 text-sm font-medium">
        <span className="text-muted-foreground">Language</span>

        <div>
          <Select
            onValueChange={(value) =>
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
                    value === currentLanguage
                      ? 'space-x-2 bg-muted'
                      : 'space-x-2'
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
