import { MetadataRoute } from "next";
import { APP_URL } from "../../constants";

export default async function robots(): Promise<MetadataRoute.Robots> {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${APP_URL}/sitemap.xml`,
		host: APP_URL,
	};
}
