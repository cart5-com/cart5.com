import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
  envDir: "../../",
  envPrefix: "PUBLIC_",
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
})
