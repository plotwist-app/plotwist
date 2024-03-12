'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { TableColumnHeader } from '@/components/table'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { List, ListItem } from '@/types/supabase/lists'
import { useLists } from '@/context/lists'
import { APP_QUERY_CLIENT } from '@/context/app/app'

import { Dictionary } from '@/utils/dictionaries'
import { listPageQueryKey } from '@/utils/list'
import { locale } from '@/utils/date/locale'
import { Language } from '@/types/languages'
import { Status } from '../status'
import { ListItemActions } from '../list-items'

type Columns = (
  dictionary: Dictionary,
  language: Language,
  mode: 'EDIT' | 'SHOW',
) => ColumnDef<ListItem>[]

export const columns: Columns = (dictionary, language, mode) => {
  const commonColumns: ColumnDef<ListItem>[] = [
    {
      id: dictionary.data_table_columns.index,
      accessorKey: 'index',
      header: ({ column }) => <TableColumnHeader column={column} title="" />,
      cell: ({ row }) => {
        return (
          <span className="select-none font-bold text-muted-foreground">
            {row.index + 1}.
          </span>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: dictionary.data_table_columns.title,
      accessorKey: 'title',
      header: ({ column }) => (
        <TableColumnHeader
          column={column}
          title={dictionary.data_table.title}
          className="w-[200px]"
        />
      ),
      cell: ({ row }) => {
        const { media_type: mediaType, tmdb_id: tmdbId, title } = row.original

        const href = `/${language}/${
          mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'
        }/${tmdbId}`

        return (
          <Link href={href} className="underline-offset-4 hover:underline">
            {title}
          </Link>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: dictionary.data_table_columns.type,
      accessorKey: 'media_type',
      header: ({ column }) => (
        <TableColumnHeader column={column} title={dictionary.data_table.type} />
      ),
      cell: ({ row }) => {
        const columnId = dictionary.data_table_columns.type

        const movie = dictionary.data_table_columns.movie
        const tvSerie = dictionary.data_table_columns.tv_show

        return (
          <Badge variant="outline" className="whitespace-nowrap">
            {row.getValue(columnId) === 'MOVIE' ? movie : tvSerie}
          </Badge>
        )
      },
    },
    {
      id: dictionary.data_table_columns.added_at,
      accessorKey: 'created_at',
      header: ({ column }) => (
        <TableColumnHeader
          column={column}
          title={dictionary.data_table.added_at}
        />
      ),
      cell: ({ row }) => {
        const columnId = dictionary.data_table_columns.added_at

        return (
          <p className="whitespace-nowrap text-xs">
            {format(new Date(row.getValue(columnId)), 'PPP', {
              locale: locale[language],
            })}
          </p>
        )
      },
    },
    {
      id: dictionary.data_table_columns.status,
      accessorKey: 'status',
      header: ({ column }) => (
        <TableColumnHeader
          column={column}
          title={dictionary.data_table.status}
          className="w-[30px]"
        />
      ),
      cell: ({ row }) => {
        const columnId = dictionary.data_table_columns.status

        return <Status status={row.getValue(columnId)} />
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: dictionary.data_table_columns.rating,
      accessorKey: 'rating',
      header: ({ column }) => (
        <TableColumnHeader
          column={column}
          title={dictionary.data_table_columns.rating}
        />
      ),
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { handleChangeListRating } = useLists()
        const { rating, id, list_id: listId } = row.original

        if (mode === 'SHOW') {
          return <Badge variant="outline">{rating ?? '?'}</Badge>
        }

        return (
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Badge variant="outline" className="cursor-pointer">
                    {rating ?? '?'}
                  </Badge>
                </div>
              </PopoverTrigger>

              <PopoverContent>
                <div className="space-y-2">
                  <Slider
                    max={10}
                    min={0}
                    step={1}
                    defaultValue={[rating ?? 0]}
                    onValueCommit={(value) => {
                      handleChangeListRating.mutate(
                        {
                          listItemId: id,
                          rating: value[0],
                        },

                        {
                          onSuccess: () => {
                            APP_QUERY_CLIENT.setQueryData(
                              listPageQueryKey(listId),
                              (query: { data: List }) => {
                                const newListItems = query.data.list_items.map(
                                  (listItem) => {
                                    if (listItem.id === id) {
                                      return {
                                        ...listItem,
                                        rating: value[0],
                                      }
                                    }

                                    return listItem
                                  },
                                )

                                return {
                                  ...query,
                                  data: {
                                    ...query.data,
                                    list_items: newListItems,
                                  },
                                }
                              },
                            )
                          },
                        },
                      )
                    }}
                  />

                  <div className="flex w-full justify-between border-t">
                    {Array.from({ length: 11 }).map((_, index) => (
                      <div
                        className="relative flex translate-x-[3px] flex-col items-center"
                        key={index}
                      >
                        <div className="h-[4px] w-[1px] bg-muted" />
                        <div className="text-xs">{index}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )
      },
    },
  ]

  const editModeColumns: ColumnDef<ListItem>[] = [
    {
      id: 'options',
      accessorKey: '',
      header: ({ column }) => (
        <TableColumnHeader
          column={column}
          title=""
          className="flex justify-end"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <ListItemActions listItem={row.original} />
          </div>
        )
      },
    },
  ]

  return mode === 'EDIT'
    ? [...commonColumns, ...editModeColumns]
    : commonColumns
}
