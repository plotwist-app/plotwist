import nextMDX from "@next/mdx";

const withMDX = nextMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: "image.tmdb.org",
			},
		],
		unoptimized: true,
	},
	pageExtensions: ["mdx", "ts", "tsx"],
	transpilePackages: ["@plotwist/tmdb", "@plotwist/ui"],
};

export default withMDX(nextConfig);
