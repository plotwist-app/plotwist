"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";
import { toast } from "sonner";

import {
	Copy,
	ExternalLink,
	Heart,
	HeartOff,
	Instagram,
	Share,
	Twitter,
} from "lucide-react";

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@plotwist/ui/components/ui/context-menu";
import { ProBadge } from "@/components/pro-badge";

import { useList } from "@/hooks/use-list";
import { APP_URL } from "../../../../../constants";

import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";

import { PopularList } from "@/types/supabase/lists";

type PopularListCardContextMenuProps = {
	href: string;
	list: PopularList;
} & PropsWithChildren;

export const PopularListCardContextMenu = ({
	children,
	href,
	list,
}: PopularListCardContextMenuProps) => {
	const { handleLike, handleRemoveLike, handleCloneList } = useList();
	const { user } = useAuth();
	const { dictionary } = useLanguage();

	const userLike = list.list_likes.find((like) => like.user_id === user?.id);

	return (
		<ContextMenu>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuItem asChild>
					<Link href={href}>
						<ExternalLink className="mr-2 size-4" />
						{dictionary.visit}
					</Link>
				</ContextMenuItem>

				{userLike ? (
					<ContextMenuItem onClick={() => handleRemoveLike.mutate(userLike.id)}>
						<HeartOff className="mr-2 size-4" />
						{dictionary.remove_like}
					</ContextMenuItem>
				) : (
					<ContextMenuItem
						onClick={() => {
							if (user) {
								handleLike.mutate({
									listId: list.id,
									userId: user.id,
								});
							}
						}}
						disabled={!user}
					>
						<Heart className="mr-2 size-4" />
						{dictionary.like}
					</ContextMenuItem>
				)}

				<ContextMenuItem
					disabled={user?.subscription_type !== "PRO"}
					onClick={() => {
						if (user) {
							handleCloneList.mutate({
								listId: list.id,
								userId: user.id,
							});
						}
					}}
				>
					<Copy className="mr-2 size-4" />
					{dictionary.clone}
					<ProBadge className="ml-2" />
				</ContextMenuItem>

				<ContextMenuSub>
					<ContextMenuSubTrigger>
						<Share className="mr-2 size-4" />
						{dictionary.share}
					</ContextMenuSubTrigger>

					<ContextMenuSubContent className="w-72">
						<ContextMenuItem
							onClick={() => {
								navigator.clipboard.writeText(`${APP_URL}${href}`);

								toast.success(dictionary.link_copied_to_clipboard);
							}}
						>
							<Copy className="mr-2 size-4" />
							{dictionary.copy_link}
						</ContextMenuItem>

						<ContextMenuItem disabled className="flex justify-between">
							<div className="flex">
								<Twitter className="mr-2 size-4" />
								{dictionary.share_to_twitter}
							</div>

							<ProBadge className="ml-2" />
						</ContextMenuItem>

						<ContextMenuItem disabled className="flex justify-between">
							<div className="flex">
								<Instagram className="mr-2 size-4" />
								{dictionary.share_to_instagram}
							</div>

							<ProBadge className="ml-2" />
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
			</ContextMenuContent>
		</ContextMenu>
	);
};
