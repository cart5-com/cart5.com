// @ts-check
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

console.log("🟨process.env.SOURCE_COMMIT", process.env.SOURCE_COMMIT)

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  server: {
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
    }
  }
});
