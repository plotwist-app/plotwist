import "@plotwist/ui/globals.css";

import type { Metadata } from "next";
import { Space_Grotesk as SpaceGrotesk } from "next/font/google";
import type { Language } from "@/types/languages";
import { GTag } from "@/components/gtag";

const spaceGrotesk = SpaceGrotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		template: "Plotwist • %s",
		default: "Plotwist",
	},
	icons: {
		icon: [
			{
				url: "/favicon.ico",
				href: "/favicon.ico",
				rel: "icon",
			},
			{
				url: "/apple-icon.png",
				href: "/apple-icon.png",
				rel: "apple-touch-icon",
			},
		],
	},
};

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { lang: Language };
}) {
	return (
		<html
			lang={params.lang}
			className={spaceGrotesk.className}
			suppressHydrationWarning
		>
			<head>
				<meta name="theme-color" content="#09090b" />

				<GTag />
			</head>

			<body className="bg-background antialiased">{children}</body>
		</html>
	);
}
