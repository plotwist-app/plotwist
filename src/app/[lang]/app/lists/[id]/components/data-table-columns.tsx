'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import { ListItem } from '@/types/supabase/lists'

import { Badge } from '@/components/ui/badge'

import { Status } from './status'
import { DataTableColumnHeader } from './data-table-column-header'
import { ListItemActions } from './list-item-actions'
import { Dictionary } from '@/utils/dictionaries'
import { Language } from '@/types/languages'
import { locale } from '@/utils/date/locale'

type Columns = (
  dictionary: Dictionary,
  language: Language,
) => ColumnDef<ListItem>[]

export const columns: Columns = (dictionary, language) => [
  {
    id: dictionary.data_table_columns.index,
    accessorKey: 'index',
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
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
      <DataTableColumnHeader
        column={column}
        title={dictionary.data_table.title}
        className="w-[200px]"
      />
    ),
    cell: ({ row }) => {
      const { media_type: mediaType, tmdb_id: tmdbId, title } = row.original

      const href = `${language}/app/${
        mediaType === 'TV_SHOW' ? 'tv-shows' : 'movies'
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
      <DataTableColumnHeader
        column={column}
        title={dictionary.data_table.type}
      />
    ),
    cell: ({ row }) => {
      const columnId = dictionary.data_table_columns.title

      const movie = dictionary.data_table_columns.movie
      const tvShow = dictionary.data_table_columns.tv_show

      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {row.getValue(columnId) === 'MOVIE' ? movie : tvShow}
        </Badge>
      )
    },
  },
  {
    id: dictionary.data_table_columns.added_at,
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader
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
      <DataTableColumnHeader
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
    id: 'options',
    accessorKey: '',
    header: ({ column }) => (
      <DataTableColumnHeader
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
