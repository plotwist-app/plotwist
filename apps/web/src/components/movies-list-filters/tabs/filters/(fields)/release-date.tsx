'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { Calendar } from '@plotwist/ui/components/ui/calendar'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@plotwist/ui/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useLanguage } from '@/context/language'
import { locale } from '@/utils/date/locale'
import type { MoviesListFiltersFormValues } from '../../../movies-list-filters-schema'

export const ReleaseDateField = () => {
  const { dictionary, language } = useLanguage()
  const { control, watch } = useFormContext<MoviesListFiltersFormValues>()

  const startDate = watch('release_date.gte')
  const endDate = watch('release_date.lte')

  return (
    <div className="grid grid-cols-2 gap-2">
      <FormField
        control={control}
        name="release_date.gte"
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel>
              {dictionary.movies_list_filters.release_date_field.from_label}
            </FormLabel>

            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      aria-label="Open popover date"
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {value ? (
                        format(new Date(value), 'PP', {
                          locale: ptBR,
                        })
                      ) : (
                        <p className="text-muted-foreground">
                          {
                            dictionary.movies_list_filters.release_date_field
                              .from_placeholder
                          }
                        </p>
                      )}

                      <span className="sr-only">
                        {
                          dictionary.movies_list_filters.release_date_field
                            .from_placeholder
                        }
                      </span>
                    </Button>
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={endDate ? endDate.getFullYear() : 2030}
                    disabled={endDate && { after: new Date(endDate) }}
                    initialFocus
                    locale={locale[language]}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="release_date.lte"
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel>
              {dictionary.movies_list_filters.release_date_field.to_label}
            </FormLabel>

            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      aria-label="Open popover date"
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {value ? (
                        format(new Date(value), 'PP', {
                          locale: ptBR,
                        })
                      ) : (
                        <p className="text-muted-foreground">
                          {
                            dictionary.movies_list_filters.release_date_field
                              .to_placeholder
                          }
                        </p>
                      )}

                      <span className="sr-only">
                        {
                          dictionary.movies_list_filters.release_date_field
                            .to_placeholder
                        }
                      </span>
                    </Button>
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    captionLayout="dropdown"
                    toYear={2030}
                    fromYear={startDate ? startDate.getFullYear() : 1900}
                    disabled={
                      startDate && {
                        before: new Date(startDate),
                      }
                    }
                    initialFocus
                    locale={locale[language]}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
