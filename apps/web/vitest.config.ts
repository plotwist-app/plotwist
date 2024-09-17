import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const r = (p: string) => resolve(__dirname, p);

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		coverage: {
			provider: "v8",
			include: ["src/**/"],
			reporter: ["html"],
		},
		setupFiles: ["./test/setup.ts", "./test/mocks.ts"],
	},
	resolve: {
		alias: {
			"@/": r("./src"),
			"@": r("./src"),
		},
	},
});
