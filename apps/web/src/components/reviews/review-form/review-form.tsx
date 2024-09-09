"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@plotwist/ui/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@plotwist/ui/components/ui/form";
import { Textarea } from "@plotwist/ui/components/ui/textarea";

import { APP_QUERY_CLIENT } from "@/context/app/app";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";

import { useReviews } from "@/hooks/use-reviews/use-reviews";
import { Dictionary } from "@/utils/dictionaries";

import { ReviewsProps } from "..";
import { ReviewStars } from "../review-stars";
import Link from "next/link";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@plotwist/ui/components/ui/avatar";
import { tmdbImage } from "@/utils/tmdb/image";

export const reviewFormSchema = (dictionary: Dictionary) =>
	z.object({
		review: z.string().min(1, dictionary.review_form.required),

		rating: z
			.number()
			.min(0, "Required")
			.max(5, dictionary.review_form.rating_max),
	});

export type ReviewFormValues = z.infer<ReturnType<typeof reviewFormSchema>>;

export const ReviewForm = ({ tmdbItem, mediaType }: ReviewsProps) => {
	const { handleCreateReview } = useReviews();
	const { user } = useAuth();
	const { dictionary, language } = useLanguage();

	const form = useForm<ReviewFormValues>({
		resolver: zodResolver(reviewFormSchema(dictionary)),
		defaultValues: {
			review: "",
			rating: 0,
		},
	});

	if (!user) {
		return (
			<div className="flex items-start space-x-4">
				<div className="aspect-square h-10 w-10 rounded-full border bg-muted" />

				<div className="relative flex-1 space-y-1 rounded-md border border-dashed p-4 shadow">
					<p className="text-sm">
						<Link href="/login" className="text-muted-foreground underline">
							{dictionary.user_last_review.login}
						</Link>{" "}
						{dictionary.user_last_review.or}{" "}
						<Link href="/sign-up" className="text-muted-foreground underline">
							{dictionary.user_last_review.register}
						</Link>{" "}
						{dictionary.user_last_review.make_first_review}
					</p>
				</div>
			</div>
		);
	}

	const onSubmit = async (values: ReviewFormValues) => {
		await handleCreateReview.mutateAsync(
			{
				...values,
				mediaType,
				userId: user.id,
				tmdbItem,
				language,
			},

			{
				onSettled: async () => {
					await APP_QUERY_CLIENT.invalidateQueries({
						queryKey: ["reviews"],
					});

					form.reset();
					toast.success(dictionary.review_form.success);
				},
			},
		);
	};

	const username = user?.username;
	const usernameInitial = username[0].toUpperCase();

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex items-start space-x-4"
			>
				<Link href={`/${language}/${username}`}>
					<Avatar className="size-10 border text-[10px] shadow">
						{user.image_path && (
							<AvatarImage
								src={tmdbImage(user.image_path, "w500")}
								className="object-cover"
								alt={username}
							/>
						)}

						<AvatarFallback>{usernameInitial}</AvatarFallback>
					</Avatar>
				</Link>

				<div className="w-full space-y-2">
					<div className="flex justify-between">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-muted-foreground">{username}</span>
							<span className="h-1 w-1 rounded-full bg-muted" />
							<FormField
								control={form.control}
								name="rating"
								render={({ field }) => (
									<ReviewStars onChange={field.onChange} rating={field.value} />
								)}
							/>
						</div>

						<div className="flex justify-end">
							<Button
								variant="outline"
								type="submit"
								loading={form.formState.isSubmitting}
								size="sm"
							>
								{dictionary.review_form.publish}
							</Button>
						</div>
					</div>

					<FormField
						control={form.control}
						name="review"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										placeholder={dictionary.review_form.placeholder}
										rows={4}
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</form>
		</Form>
	);
};
