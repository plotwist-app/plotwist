"use client";

import { Separator } from "@plotwist/ui/components/ui/separator";
import { Skeleton } from "@plotwist/ui/components/ui/skeleton";
import { useLanguage } from "@/context/language";
import { getFollowersAndFollowing } from "@/services/api/followers/get-followers-and-following";
import { useQuery } from "@tanstack/react-query";

type FollowersProps = { profileId: string };
export const Followers = ({ profileId }: FollowersProps) => {
	const { dictionary } = useLanguage();
	const { data, isLoading } = useQuery({
		queryFn: async () => await getFollowersAndFollowing(profileId),
		queryKey: ["followers-and-following", profileId],
	});

	return (
		<div className="flex items-center gap-2 text-sm text-muted-foreground">
			<div className="flex gap-1">
				{isLoading ? (
					<Skeleton className="aspect-square w-[2ch]" />
				) : (
					<span className="font-medium text-foreground">
						{data?.followers.length}
					</span>
				)}

				<p>{dictionary.followers}</p>
			</div>

			<Separator orientation="vertical" className="h-4" />

			<div className="flex gap-1">
				{isLoading ? (
					<Skeleton className="aspect-square w-[2ch]" />
				) : (
					<span className="font-medium text-foreground">
						{data?.following.length}
					</span>
				)}

				<p>{dictionary.following}</p>
			</div>
		</div>
	);
};
