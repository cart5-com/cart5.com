// @ts-check
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import sentry from "@sentry/astro";
import { fileURLToPath, URL } from 'node:url'
import vue from "@astrojs/vue";

import tailwindcss from "@tailwindcss/vite";

console.log("🟨process.env.SOURCE_COMMIT", process.env.SOURCE_COMMIT)
const IS_DEV_BUILD = process.env.npm_lifecycle_event === 'builddev';
const IS_DEV_CADDY = process.env.npm_lifecycle_event === 'dev:caddy';
const IS_DEV = process.env.npm_lifecycle_event === 'dev';


// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  build: {
    assetsPrefix: "https://cart5-web-store-prod-pages.cart5.com/"
  },
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
    port: parseInt(process.env.PORT || '3002'),
  },
  vite: {
    build: {
      sourcemap: true,
      minify: true,
    },

    server: {
      host: '0.0.0.0',
      proxy: {
        '/__p_api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: false,
          rewrite: (path) => path.replace(/^\/__p_api/, '')
        },
        '/dashboard/': {
          target: 'http://127.0.0.1:3004',
          changeOrigin: false,
          // rewrite: (path) => path.replace(/^\/dashboard/, '')
        },
        // '/__p_ecom': {
        //   target: 'http://127.0.0.1:3003',
        //   changeOrigin: false,
        //   rewrite: (path) => path.replace(/^\/__p_ecom/, '')
        // },
      },
    },

    plugins: [
      tailwindcss()
    ],


    resolve: {
      alias: {
        "@": fileURLToPath(
          new URL("../../packages/ui-shadcn-vue/src", import.meta.url),
        ),
        "@web-astro": fileURLToPath(
          new URL("./src", import.meta.url),
        ),
        "@web-astro/*": fileURLToPath(
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
  },
  integrations: [
    vue({
      appEntrypoint: './src/vueAppEntrypoint.ts',
      // devtools: {
      //   launchEditor: "code"
      // },
    }),
    ...(IS_DEV_BUILD || IS_DEV_CADDY || IS_DEV ? [] : [
      sentry({
        enabled: {
          client: true,
          server: true
        },
        dsn: "https://bebf6662621f81fad9399cb284f5dec3@o4509024863518720.ingest.us.sentry.io/4509024868761600",
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        environment: process.env.NODE_ENV || 'development',
        sourceMapsUploadOptions: {
          project: "web-astro",
          authToken: process.env.SENTRY_AUTH_TOKEN || '',
        },
      })
    ])
  ]
});