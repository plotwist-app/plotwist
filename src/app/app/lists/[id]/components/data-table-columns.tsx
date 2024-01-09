'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import { ListItem } from '@/types/supabase/lists'

import { Badge } from '@/components/ui/badge'

import { Status } from './status'
import { DataTableColumnHeader } from './data-table-column-header'
import { ListItemActions } from './list-item-actions'

export const columns: ColumnDef<ListItem>[] = [
  {
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Title"
        className="w-[200px]"
      />
    ),
    cell: ({ row }) => {
      const { media_type: mediaType, tmdb_id: tmdbId, title } = row.original

      return (
        <Link
          href={`/app/${
            mediaType === 'TV_SHOW' ? 'tv-shows' : 'movies'
          }/${tmdbId}`}
          className="underline-offset-4 hover:underline"
        >
          {title}
        </Link>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'type',
    accessorKey: 'media_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {row.getValue('type') === 'MOVIE' ? 'Movie' : 'TV Show'}
        </Badge>
      )
    },
  },
  {
    id: 'overview',
    accessorKey: 'overview',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Overview"
        className="w-[250px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <p className="line-clamp-2  text-xs text-muted-foreground">
          {row.getValue('overview')}
        </p>
      )
    },
  },
  {
    id: 'Added at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added at" />
    ),
    cell: ({ row }) => {
      return (
        <p className="whitespace-nowrap text-xs">
          {format(new Date(row.getValue('Added at')), 'PPP')}
        </p>
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
        className="w-[30px]"
      />
    ),
    cell: ({ row }) => {
      return <Status status={row.getValue('status')} />
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
