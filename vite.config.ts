import { defineConfig } from "vite";

export default defineConfig({
  base: "/redlight-greenlight/",
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    target: "es2020",
  },
});
