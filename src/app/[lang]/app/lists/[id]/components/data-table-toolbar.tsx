'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { statuses } from './data'

import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { useLanguage } from '@/context/language'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { dictionary } = useLanguage()

  const isFiltered = table.getState().columnFilters.length > 0

  const titleColumn = table.getColumn(dictionary.data_table_columns.title)

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={dictionary.data_table_toolbar.filter_items_placeholder}
          value={(titleColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => titleColumn?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn(dictionary.data_table_columns.status) && (
          <DataTableFacetedFilter
            column={table.getColumn(dictionary.data_table_columns.status)}
            title={dictionary.data_table_columns.status}
            options={statuses(dictionary)}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {dictionary.data_table_toolbar.reset}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  )
}
