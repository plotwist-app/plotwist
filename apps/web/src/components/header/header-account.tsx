"use client";

import Link from "next/link";
import { LogIn, LogOut, User } from "lucide-react";

import { useAuth } from "@/context/auth";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@plotwist/ui/components/ui/dropdown-menu";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@plotwist/ui/components/ui/avatar";

import { tmdbImage } from "@/utils/tmdb/image";
import { useLanguage } from "@/context/language";
import { HeaderNavigationDrawerConfigs } from "./header-navigation-drawer-configs";

import type { Profile } from "@/types/supabase";

type AvatarContentProps = {
	user: Profile | null;
};

const AvatarContent = ({ user }: AvatarContentProps) => {
	if (!user) {
		return (
			<AvatarFallback>
				<User className="size-4 text-muted-foreground" />
			</AvatarFallback>
		);
	}

	if (user.image_path) {
		return (
			<AvatarImage
				src={tmdbImage(user.image_path)}
				alt={user.username}
				className="object-cover"
			/>
		);
	}

	return <AvatarFallback>{user.username[0]}</AvatarFallback>;
};

export const HeaderAccount = () => {
	const { user, logout } = useAuth();
	const { language, dictionary } = useLanguage();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="size-8 cursor-pointer border">
					<AvatarContent user={user} />
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-72">
				{user && (
					<>
						<Link
							href={`/${language}/${user.username}`}
							className="flex items-center gap-2 p-1 text-sm"
						>
							<Avatar className="size-8 cursor-pointer">
								<AvatarContent user={user} />
							</Avatar>
							{user.username}
						</Link>

						<DropdownMenuSeparator />
					</>
				)}

				<HeaderNavigationDrawerConfigs />
				<DropdownMenuSeparator />

				{user ? (
					<DropdownMenuItem onClick={() => logout()}>
						<LogOut className="mr-1 size-3" />
						{dictionary.logout}
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem
						asChild
						className="font-medium text-muted-foreground"
					>
						<Link href={`/${language}/login`}>
							<LogIn className="mr-1 size-3" />
							{dictionary.login}
						</Link>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
