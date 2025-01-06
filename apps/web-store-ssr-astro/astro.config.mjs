// @ts-check
import { defineConfig } from 'astro/config';

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  server: {
    host: '0.0.0.0',
  },
  vite: {
    server: {
      host: '0.0.0.0',
      proxy: {
        '/__p_auth': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: false,
          rewrite: (path) => path.replace(/^\/__p_auth/, '')
        },
      },
    }
  }
});
