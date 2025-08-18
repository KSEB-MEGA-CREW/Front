import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS 플러그인 임포트
  ],

  // 개발 서버 설정
  server: {
    port: 3000,
    // ❌ 제거: historyApiFallback은 Vite에서 지원하지 않는 속성
    host: true,

    // ✅ HMR 설정 개선
    hmr: {
      port: 3001,
      host: "localhost",
    },

    // ❌ 제거: ws 설정이 중복됨 (hmr에 이미 포함)

    // ✅ 프록시 설정 개선
    proxy: {
      "/api": {
        target: "http://165.246.241.10:8080",
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },

      // OAuth2 관련 요청 프록시
      "/oauth2": {
        target: "http://165.246.241.10:8080",
        changeOrigin: true,
        secure: false,
        timeout: 60000,
      },

      // ❌ 수정: /login은 프론트엔드 라우트이므로 프록시 제거

      // ✅ WebSocket 프록시
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true,
      },
    },
  },

  // ✅ 환경변수 설정 개선
  define: {
    __API_URL__: JSON.stringify(
      process.env.VITE_API_URL || "http://165.246.241.10:8080"
    ),
  },

  // 빌드 설정
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV === "development",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },

  // 경로 별칭 설정
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@api": "/src/api",
      "@store": "/src/store",
      "@utils": "/src/utils",
    },
  },
});
