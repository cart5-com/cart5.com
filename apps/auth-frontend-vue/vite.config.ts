import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { sentryVitePlugin } from "@sentry/vite-plugin";

console.log("🟨process.env.SOURCE_COMMIT", process.env.SOURCE_COMMIT)
const IS_DEV_BUILD = process.env.npm_lifecycle_event === 'builddev';
const IS_DEV_CADDY = process.env.npm_lifecycle_event === 'dev:caddy';
const IS_DEV = process.env.npm_lifecycle_event === 'dev';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    ? 'https://cart5-auth-frontend-prod-pages.cart5.com/'
    : '/',
  server: {
    allowedHosts: [
      "auth.cart5dev.com",
    ],
    host: '0.0.0.0',
    proxy: {
      '/__p_api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/__p_api/, '')
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwind(),
        autoprefixer()
      ],
    },
  },
  build: {
    minify: true,
    sourcemap: true,
  },
  plugins: [
    vue(),
    ...(IS_DEV_BUILD || IS_DEV_CADDY || IS_DEV ? [] : [
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "cart5com",
        project: "auth-frontend-vue",
      })
    ])
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL("../../packages/ui-shadcn-vue/src", import.meta.url),
      ),
      "@auth-frontend-vue": fileURLToPath(
        new URL("./src", import.meta.url),
      ),
      "@lib": fileURLToPath(
        new URL("../../packages/lib/src", import.meta.url),
      ),
      "@api-client": fileURLToPath(
        new URL("../../packages/api-client/src", import.meta.url),
      ),

      // "@db": fileURLToPath(
      //   new URL("../../packages/db/src", import.meta.url),
      // ),
      // "@api-hono": fileURLToPath(
      //   new URL("../../apps/api-hono/src", import.meta.url),
      // ),

      // "@root": fileURLToPath(
      //   new URL("../../packages/lib", import.meta.url),
      // ),
      // 'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
}))
