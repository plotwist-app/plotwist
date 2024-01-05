import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Skeleton } from '@/components/ui/skeleton'

export const ListItemsTableSkeleton = () => {
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
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell className="font-bold text-muted-foreground">
              <Skeleton className="h-4 w-[2ch]" />
            </TableCell>

            <TableCell className="w-[200px] font-medium">
              <Skeleton className="h-4 w-[10ch]" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-[7ch]" />
            </TableCell>

            <TableCell>
              <div className="space-y-1">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </TableCell>

            <TableCell className="text-xs">
              <Skeleton className="h-4 w-[17ch]" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-[10ch]" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
