import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000, // 원하는 포트 번호로 변경
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 스프링부트 서버 주소
      changeOrigin: true,
      secure: false,
    }
  },
});
