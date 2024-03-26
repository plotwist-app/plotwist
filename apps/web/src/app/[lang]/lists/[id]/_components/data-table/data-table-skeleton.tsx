'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '@plotwist/ui'

import { useLanguage } from '@/context/language'

export const DataTableSkeleton = () => {
  const { dictionary } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center space-x-2">
          <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
          <Skeleton className="h-8 w-[88px]" />
        </div>

        <Skeleton className="h-8 w-[76px]" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[1ch]"></TableHead>
            <TableHead className="w-[400px]">
              {dictionary.data_table_columns.title}
            </TableHead>
            <TableHead>{dictionary.data_table_columns.type}</TableHead>
            <TableHead>{dictionary.data_table_columns.added_at}</TableHead>
            <TableHead>{dictionary.data_table_columns.status}</TableHead>
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
    </div>
  )
}
