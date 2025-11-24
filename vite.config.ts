import { defineConfig } from "vite";

export default defineConfig({
  // 개발 환경에서는 루트, 프로덕션에서는 GitHub Pages 경로
  base: process.env.NODE_ENV === "production" ? "/redlight-greenlight/" : "/",
  // base: "/redlight-greenlight/",
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    target: "es2020",
  },
});
