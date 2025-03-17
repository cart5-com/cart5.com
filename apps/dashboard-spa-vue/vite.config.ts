import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

console.log("🟨process.env.SOURCE_COMMIT", process.env.SOURCE_COMMIT)

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    // ? 'https://cdn.mydomain.com/auth-frontend-vue/'
    ? '/dash/'
    : '/dash/',
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
      "pubo-restaurant.secondpartner.com",
      "pubo-restaurant.com",
      "www.pubo-restaurant.com",
    ],
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 3004,
      clientPort: 3004,
      path: '/dash/socket',
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
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL("../../packages/ui-shadcn-vue/src", import.meta.url),
      ),
      "@src": fileURLToPath(
        new URL("./src", import.meta.url),
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
