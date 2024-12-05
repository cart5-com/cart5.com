// @ts-check
import { defineConfig } from 'astro/config';

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  vite: {
      envDir: "../../",
      build: {
          // sourcemap: true,
          minify: false,
      }
  },

  integrations: [vue()]
});