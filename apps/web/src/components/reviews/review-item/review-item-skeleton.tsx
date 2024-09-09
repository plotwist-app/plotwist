import { Skeleton } from "@plotwist/ui/components/ui/skeleton";
import { ReviewStars } from "../review-stars";

export const ReviewItemSkeleton = () => {
	return (
		<div className="flex items-start space-x-4">
			<Skeleton className="aspect-square h-10 w-10 rounded-full" />

			<div className="flex w-full flex-col space-y-2">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-4 w-[15ch]" />
					<span className="h-1 w-1 rounded-full bg-muted" />
					<ReviewStars rating={0} />
				</div>

				<div className="relative space-y-1 rounded-md border p-4 shadow">
					<Skeleton className="h-4 w-[30ch]" />

					<Skeleton className="absolute -bottom-2 right-2 h-5 w-[6ch] rounded-full border bg-muted px-3 py-1 text-xs" />
				</div>

				<Skeleton className="h-4 w-[15ch]" />
			</div>
		</div>
	);
};
