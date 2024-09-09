"use client";

import { fetchPopularLists } from "@/services/api/lists/fetch-popular-lists";
import { useQuery } from "@tanstack/react-query";
import { PopularListCard, PopularListCardSkeleton } from "./popular-list-card";
import { Badge } from "@plotwist/ui/components/ui/badge";
import { useLanguage } from "@/context/language";
import { useMemo } from "react";

export const PopularLists = () => {
	const { dictionary } = useLanguage();
	const { data } = useQuery({
		queryKey: ["popular-lists"],
		queryFn: fetchPopularLists,
	});

	const content = useMemo(() => {
		if (!data)
			return (
				<li className="flex flex-col gap-6">
					{Array.from({ length: 3 }).map((_, index) => (
						<PopularListCardSkeleton key={index} />
					))}
				</li>
			);

		return (
			<li className="flex flex-col gap-6">
				{data.map((list) => (
					<PopularListCard list={list} key={list.id} />
				))}
			</li>
		);
	}, [data]);

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<h2 className="text-xl font-bold">{dictionary.popular_lists}</h2>

				<div className="flex gap-2">
					<Badge variant="outline" className="cursor-not-allowed opacity-50">
						{dictionary.last_week}
					</Badge>

					<Badge variant="outline" className="cursor-not-allowed opacity-50">
						{dictionary.last_month}
					</Badge>

					<Badge>{dictionary.all_time}</Badge>
				</div>
			</div>

			{content}
		</div>
	);
};
