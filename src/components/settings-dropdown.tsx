'use client'

import { useTheme } from 'next-themes'
import { LogOut, Settings } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from './ui/button'
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
} from './ui/dropdown-menu'

import { Locale } from '@/types/locales'
import { SUPPORTED_LOCALES } from '../../locales'

export const SettingsDropdown = () => {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const { replace } = useRouter()

  const currentLocale = pathname.split('/')[1]

  const handleRedirectLocaleChange = (locale: Locale) => {
    const paramsArray = pathname.split('/')
    const newParamsArray = paramsArray.map((param, index) =>
      index === 1 ? locale : param,
    )

    const newPathname = newParamsArray.join('/')
    replace(newPathname)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          onClick={() =>
            theme === 'dark' ? setTheme('light') : setTheme('dark')
          }
          size="icon"
        >
          <Settings width={16} height={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'bg-muted' : 'cursor-pointer'}
          >
            🌞 Light
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'bg-muted' : 'cursor-pointer'}
          >
            🌚 Dark
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Language</DropdownMenuLabel>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>English</DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {SUPPORTED_LOCALES.map(({ value, country, label, enabled }) => (
                <DropdownMenuItem
                  key={value}
                  className={
                    value === currentLocale ? 'space-x-2 bg-muted' : 'space-x-2'
                  }
                  disabled={!enabled}
                  onClick={() => handleRedirectLocaleChange(value)}
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

        {pathname.startsWith('/app') ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>

              <DropdownMenuItem className="flex cursor-pointer gap-1 hover:bg-muted">
                <LogOut width={16} height={16} /> Logout
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
