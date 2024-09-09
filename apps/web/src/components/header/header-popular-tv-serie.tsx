"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { tmdb } from "@plotwist/tmdb";
import { Skeleton } from "@plotwist/ui/components/ui/skeleton";

import { tmdbImage } from "@/utils/tmdb/image";

import type { Language } from "@/types/languages";
type HeaderPopularTvSerieProps = {
	language: Language;
};

export const HeaderPopularTvSerie = ({
	language,
}: HeaderPopularTvSerieProps) => {
	const { data, isLoading } = useQuery({
		queryKey: ["popular-tv", language],
		queryFn: async () =>
			await tmdb.tv.list({
				language,
				page: 1,
				list: "popular",
			}),
	});

	if (!data || isLoading)
		return (
			<Skeleton className="aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow" />
		);

	const tvSerie = data.results[0];

	return (
		<Link
			className="relative aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow"
			href={`/${language}/tv-series/${tvSerie.id}`}
		>
			<Image src={tmdbImage(tvSerie.poster_path)} alt={tvSerie.name} fill />
		</Link>
	);
};
