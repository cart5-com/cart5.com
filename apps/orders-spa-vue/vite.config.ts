import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
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
    ? 'https://cart5-orders-prod-pages.cart5.com/'
    : '/orders/',
  server: {
    allowedHosts: [
      "www.cart5dev.com",
      "cart5dev.com",
      "obite.cart5dev.com",
      "obite.com",
      "obite.co.uk",
      "www.obite.com",
      "www.obite.co.uk",
      "flames.obite.com",
      "flames.obite.co.uk",
      "flames.com",
      "www.flames.com",
      "secondpartner.cart5dev.com",
      "secondpartner.com",
      "www.secondpartner.com",
      "pubo-store.secondpartner.com",
      "pubo-store.com",
      "www.pubo-store.com",
    ],
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 3005,
      clientPort: 3005,
      path: '/orders/socket',
      timeout: 10000,
      overlay: true,
    }
    // proxy: {
    //   '/__p_api': {
    //     target: 'http://127.0.0.1:3000',
    //     changeOrigin: false,
    //     rewrite: (path) => path.replace(/^\/__p_api/, '')
    //   }
    // },
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  build: {
    minify: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        autoprint: fileURLToPath(new URL('./autoprint.html', import.meta.url)),
        always_top_on: fileURLToPath(new URL('./always_top_on.html', import.meta.url))
      }
    }
  },
  plugins: [
    vue(),
    ...(IS_DEV_BUILD || IS_DEV_CADDY || IS_DEV ? [] : [
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "cart5com",
        project: "orders-spa-vue",
      })
    ])
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL("../../packages/ui-shadcn-vue/src", import.meta.url),
      ),
      "@orders-spa-vue": fileURLToPath(
        new URL("./src", import.meta.url),
      ),
      "@orders-spa-vue/*": fileURLToPath(
        new URL("./src/*", import.meta.url),
      ),
      "@lib": fileURLToPath(
        new URL("../../packages/lib/src", import.meta.url),
      ),
      "@api-client": fileURLToPath(
        new URL("../../packages/api-client/src", import.meta.url),
      ),
      "@db": fileURLToPath(
        new URL("../../packages/db/src", import.meta.url),
      ),
      "@api-hono": fileURLToPath(
        new URL("../../apps/api-hono/src", import.meta.url),
      ),
      // "@root": fileURLToPath(
      //   new URL("../../packages/lib", import.meta.url),
      // ),
      // 'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
}))
