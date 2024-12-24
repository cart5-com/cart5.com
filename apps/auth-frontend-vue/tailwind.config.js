import tailwindConfig from "ui-shadcn-vue/tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  ...tailwindConfig,
  content: [
    "./src/**/*.{ts,tsx,vue}",
    "../../packages/ui-shadcn-vue/src/**/*.{ts,tsx,vue}",
    // add ui packages path if required
  ],
};
