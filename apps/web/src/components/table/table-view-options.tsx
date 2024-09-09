"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@plotwist/ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@plotwist/ui/components/ui/dropdown-menu";
import { useLanguage } from "@/context/language";

interface TableViewOptionsProps<T> {
	table: Table<T>;
}

export function TableViewOptions<T>({ table }: TableViewOptionsProps<T>) {
	const { dictionary } = useLanguage();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="flex">
					<MixerHorizontalIcon className="mr-2 h-4 w-4" />
					{dictionary.data_table_view_options.view}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-fit min-w-[175px]">
				<DropdownMenuLabel>
					{dictionary.data_table_view_options.toggle_columns}
				</DropdownMenuLabel>

				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" && column.getCanHide(),
					)
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="whitespace-nowrap normal-case"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
