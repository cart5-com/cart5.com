import tailwindConfig from "ui-shadcn-vue/tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
	...tailwindConfig,
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		"./node_modules/ui-shadcn-vue/src/**/*.{ts,tsx,vue}",
		"./node_modules/astro-ui/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		// add ui packages path if required
	],
	// safelist: [{ pattern: /./ }] // means all classes are generated total: 11+ MB 🤣
};
