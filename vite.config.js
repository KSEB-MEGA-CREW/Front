import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // 개발 서버 설정
  server: {
    port: 3000,
    host: true,

    // HMR 설정
    hmr: {
      port: 3001,
      host: "localhost",
    },

    // 프록시 설정 - 개발 환경에서만 사용
    proxy: process.env.NODE_ENV === "development" ? {
      "/api": {
        target: "http://43.202.38.158:8080",
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

      "/oauth2": {
        target: "http://43.202.38.158:8080",
        changeOrigin: true,
        secure: false,
        timeout: 60000,
      },

      "/ws": {
        target: "ws://3.34.168.10:8000",
        ws: true,
        changeOrigin: true,
      },
    } : {},
  },

  // 환경변수 설정 - 운영/개발 환경 구분
  define: {
    __API_URL__: JSON.stringify(
      process.env.VITE_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "http://43.202.38.158:8080"
        : "http://localhost:8080"
      )
    ),
    __WS_URL__: JSON.stringify(
      process.env.VITE_WS_URL ||
      (process.env.NODE_ENV === "production"
        ? "ws://3.34.168.10:8000"
        : "ws://localhost:8000"
      )
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