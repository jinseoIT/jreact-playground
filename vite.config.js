import { defineConfig } from "vite";
import { resolve } from "path";

const base = process.env.NODE_ENV === "production" ? "/jreact-playground/" : "";

export default defineConfig({
  base,
});
