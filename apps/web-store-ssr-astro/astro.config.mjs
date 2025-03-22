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
  // build: {
  //   assetsPrefix: {

  //   }
  // },
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
    }
  }
});
