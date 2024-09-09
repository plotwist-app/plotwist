const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

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
	transpilePackages: ["@plotwist/tmdb"],
};

module.exports = withBundleAnalyzer(withMDX(nextConfig));
