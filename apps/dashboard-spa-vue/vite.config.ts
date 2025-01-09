import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/__p_auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/__p_auth/, '')
      },
      '/__p_ecom': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/__p_ecom/, '')
      },
    },
  },
  plugins: [vue()],
})
