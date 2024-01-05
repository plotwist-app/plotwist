import { format } from 'date-fns'
import Link from 'next/link'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ListItem } from '@/types/lists'
import { Badge } from '@/components/ui/badge'

import { Status } from './status'
import { ListItemOptions } from './list-item-options'

type ListItemsProps = {
  listItems: ListItem[]
}

export const ListItemsTable = ({ listItems }: ListItemsProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[1ch]"></TableHead>
          <TableHead className="w-[200px]">Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="w-[400px]">Overview</TableHead>
          <TableHead>Added at</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {listItems.map((item, index) => (
          <TableRow key={item.id}>
            <TableCell className="font-bold text-muted-foreground">
              {index + 1}.
            </TableCell>

            <TableCell className="w-[200px] font-medium">
              <Link
                href={`/app/${
                  item.media_type === 'tv_show' ? 'tv-shows' : 'movies'
                }/${item.tmdb_id}`}
                className="underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
            </TableCell>

            <TableCell>
              <Badge variant="outline">
                {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
              </Badge>
            </TableCell>

            <TableCell>
              <p className="line-clamp-2  text-xs text-muted-foreground">
                {item.overview}
              </p>
            </TableCell>

            <TableCell className="text-xs">
              {format(new Date(item.created_at), 'PPP')}
            </TableCell>

            <TableCell>
              <Status status={item.status} />
            </TableCell>

            <TableCell>
              <ListItemOptions listItem={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
