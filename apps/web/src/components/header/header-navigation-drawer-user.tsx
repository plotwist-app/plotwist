import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@plotwist/ui/components/ui/avatar";

import { tmdbImage } from "@/utils/tmdb/image";

import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";

import type { Profile } from "@/types/supabase";
type HeaderNavigationDrawerUserProps = {
	user: Profile;
};

export const HeaderNavigationDrawerUser = ({
	user,
}: HeaderNavigationDrawerUserProps) => {
	const { logout } = useAuth();
	const { push } = useRouter();
	const { language } = useLanguage();

	const ACTIONS = [
		{
			label: "Profile",
			icon: User,
			fn: () => push(`/${language}/${user.username}`),
		},
		{
			label: "Log out",
			icon: LogOut,
			fn: logout,
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between px-2">
				<div className="">
					<span className="font-medium">{user.username}</span>
					<p className="text-muted-foreground">{user.email}</p>
				</div>

				<Avatar className="size-6 border">
					{user.image_path && (
						<AvatarImage
							src={tmdbImage(user.image_path, "w500")}
							className="object-cover"
						/>
					)}

					<AvatarFallback>{user.username[0]}</AvatarFallback>
				</Avatar>
			</div>

			<div className="flex flex-col">
				{ACTIONS.map((action) => (
					<button
						className="flex items-center justify-between gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-muted"
						onClick={action.fn}
						key={action.label}
					>
						{action.label}

						{action.icon && <action.icon className="size-4" />}
					</button>
				))}
			</div>
		</div>
	);
};
