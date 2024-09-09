"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Input } from "@plotwist/ui/components/ui/input";
import { Button } from "@plotwist/ui/components/ui/button";

import { useLanguage } from "@/context/language";
import { TableViewOptions } from "@/components/table/table-view-options";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
}

export function DataTableToolbar<TData>({
	table,
}: DataTableToolbarProps<TData>) {
	const { dictionary } = useLanguage();

	const isFiltered = table.getState().columnFilters.length > 0;

	const titleColumn = table.getColumn(dictionary.data_table_columns.title);

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder={dictionary.data_table_toolbar.filter_items_placeholder}
					value={(titleColumn?.getFilterValue() as string) ?? ""}
					onChange={(event) => titleColumn?.setFilterValue(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>

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

			<TableViewOptions table={table} />
		</div>
	);
}
