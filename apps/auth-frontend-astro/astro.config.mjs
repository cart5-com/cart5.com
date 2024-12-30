// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath, URL } from "node:url";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    vite: {
        envDir: "../../",
        build: {
            // sourcemap: true,
            minify: true,
        },
        resolve: {
            alias: {
                "@": fileURLToPath(
                    new URL("../../packages/ui-shadcn-vue/src", import.meta.url),
                ),
                "@root": fileURLToPath(
                    new URL("./src", import.meta.url),
                ),
                // 'vue': 'vue/dist/vue.esm-bundler.js',
            },
        },
    },
    // build: {
    //     // Default: 'directory', options:('file' | 'directory' | 'preserve')
    //     //Example: Generate`page.html` instead of `page/index.html` during build.
    //     format: 'file'
    // },

    integrations: [
        vue({
            appEntrypoint: "./src/vue-app-entrypoint.ts",
            // devtools: true
        }),
        tailwind({
            applyBaseStyles: false,
        })
    ]
});