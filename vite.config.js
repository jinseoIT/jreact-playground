import { defineConfig } from "vite";
import { resolve } from "path";

const base = process.env.NODE_ENV === "production" ? "/jreact-playground" : "";

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        404: resolve(__dirname, "404.html"),
      },
    },
  },
});
