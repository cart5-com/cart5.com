import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

console.log("🟨process.env.SOURCE_COMMIT", process.env.SOURCE_COMMIT)

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    // ? 'https://cdn.mydomain.com/auth-frontend-vue/'
    ? '/'
    : '/',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/__p_auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/__p_auth/, '')
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  build: {
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
      // 'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
}))
