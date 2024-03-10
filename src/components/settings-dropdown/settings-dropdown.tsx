'use client'

import { useTheme } from 'next-themes'
import { LogOut, Settings } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../ui/dropdown-menu'
import { SUPPORTED_LANGUAGES } from '../../../languages'
import { Language } from '@/types/languages'
import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'

export const SettingsDropdown = () => {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const { replace } = useRouter()
  const { dictionary } = useLanguage()
  const { logout, user } = useAuth()

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings width={16} height={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {dictionary.settings_dropdown.theme}
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'bg-muted' : 'cursor-pointer'}
          >
            {dictionary.settings_dropdown.light}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'bg-muted' : 'cursor-pointer'}
          >
            {dictionary.settings_dropdown.dark}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {dictionary.settings_dropdown.language}
          </DropdownMenuLabel>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {currentLanguageOption && (
                <ReactCountryFlag
                  countryCode={currentLanguageOption.country}
                  svg
                  className="mr-2"
                />
              )}
              {currentLanguageOption?.label}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {SUPPORTED_LANGUAGES.map(({ value, country, label, enabled }) => (
                <DropdownMenuItem
                  key={value}
                  className={
                    value === currentLanguage
                      ? 'space-x-2 bg-muted'
                      : 'space-x-2'
                  }
                  disabled={!enabled}
                  onClick={() => handleRedirectLanguageChange(value)}
                >
                  <ReactCountryFlag
                    countryCode={country}
                    svg
                    className="mr-2"
                  />

                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {user ? (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {dictionary.settings_dropdown.account}
              </DropdownMenuLabel>

              <DropdownMenuItem
                className="flex cursor-pointer gap-1 hover:bg-muted"
                onClick={logout}
              >
                <LogOut width={16} height={16} />

                {dictionary.settings_dropdown.logout}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
