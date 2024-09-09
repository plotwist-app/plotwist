import { useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";

import { useLanguage } from "@/context/language";

import { tmdb, MovieWithMediaType, TvSerieWithMediaType } from "@plotwist/tmdb";

import {
	ListCommandMovies,
	ListCommandMoviesSkeleton,
} from "./list-command-movies";
import { ListCommandTv, ListCommandTvSkeleton } from "./list-command-tv";
import type { ListItem } from "@/types/supabase/lists";

type ListCommandVariant = "poster" | "button";
type ListCommandProps = { variant: ListCommandVariant; listItems: ListItem[] };

export const ListCommand = ({ variant, listItems }: ListCommandProps) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);
	const { language, dictionary } = useLanguage();

	const { data, isLoading } = useQuery({
		queryKey: ["search", debouncedSearch],
		queryFn: async () => await tmdb.search.multi(debouncedSearch, language),
		staleTime: 1000,
	});

	const trigger: Record<ListCommandVariant, JSX.Element> = useMemo(
		() => ({
			button: (
				<div
					className="flex  cursor-pointer items-center justify-center rounded-md border border-dashed p-2"
					onClick={() => setOpen(true)}
				>
					<Plus size={14} />
				</div>
			),
			poster: (
				<div
					className="flex h-[212px] w-[141px] cursor-pointer items-center justify-center rounded-md border border-dashed"
					onClick={() => setOpen(true)}
				>
					<Plus />
				</div>
			),
		}),
		[],
	);

	const { movies, tv } = useMemo(() => {
		if (!data)
			return {
				movies: [],
				tv: [],
			};

		const { results } = data;

		return {
			movies: results.filter(
				(result) => result.media_type === "movie",
			) as MovieWithMediaType[],

			tv: results.filter(
				(result) => result.media_type === "tv",
			) as TvSerieWithMediaType[],
		};
	}, [data]);

	const hasMovies = useMemo(() => Boolean(movies.length), [movies]);
	const hasTv = useMemo(() => Boolean(tv.length), [tv]);

	return (
		<>
			{trigger[variant]}

			<CommandDialog open={open} onOpenChange={setOpen}>
				<Command>
					<CommandInput
						placeholder={dictionary.list_command.search_placeholder}
						onValueChange={setSearch}
						value={search}
					/>

					<CommandList>
						<div className="space-y-0">
							{isLoading && (
								<>
									<ListCommandMoviesSkeleton />
									<ListCommandTvSkeleton />
								</>
							)}

							{hasMovies && (
								<ListCommandMovies movies={movies} listItems={listItems} />
							)}

							{hasTv && hasMovies && <Separator />}

							{hasTv && <ListCommandTv tv={tv} listItems={listItems} />}
						</div>

						{!hasMovies && !hasTv && (
							<p className="p-8 text-center">
								{dictionary.list_command.no_results}
							</p>
						)}
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
};
