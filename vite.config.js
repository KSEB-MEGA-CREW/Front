import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 개발 서버 설정
  server: {
    port: 3000, // React 앱 포트
    host: true, // 외부 접속 허용

    // 프록시 설정 - 백엔드 API 요청을 프록시
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot 서버
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '') // 필요시 경로 변경
      },

      // OAuth2 관련 요청 프록시
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // 환경변수 설정
  define: {
    // 환경변수를 빌드 시점에 정의
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8080/api'),
  },

  // 빌드 설정
  build: {
    outDir: 'dist',
    sourcemap: true, // 디버깅용 소스맵

    // 청크 크기 경고 제한 조정
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },

  // 경로 별칭 설정 (필요시 사용)
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@api': '/src/api',
      '@store': '/src/store',
      '@utils': '/src/utils',
    }
  }
})