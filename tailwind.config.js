/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 다크 모드를 클래스 기반으로 설정
  theme: {
    extend: {
      // 다크/라이트 모드를 위한 색상 시스템 정의
      colors: {
        // 기본 색상 팔레트 (Perplexity 스타일)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        // 다크 모드 색상
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // 라이트 모드 색상  
        light: {
          50: '#020617',
          100: '#0f172a',
          200: '#1e293b',
          300: '#334155',
          400: '#475569',
          500: '#64748b',
          600: '#94a3b8',
          700: '#cbd5e1',
          800: '#e2e8f0',
          900: '#f1f5f9',
          950: '#f8fafc'
        }
      },
      // 그라데이션 색상
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      // 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' }
        }
      },
      // 여백 및 크기
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      // 폰트 크기
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }]
      },
      // 그림자
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)'
      },
      // 트랜지션
      transitionDuration: {
        '400': '400ms',
        '600': '600ms'
      }
    },
  },
  plugins: [
    // 사용자 지정 유틸리티 클래스 추가
    function({ addUtilities }) {
      const newUtilities = {
        // 글래스모피즘 효과
        '.glass': {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        },
        '.glass-dark': {
          backdropFilter: 'blur(16px)', 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        // 사이드바 애니메이션
        '.sidebar-enter': {
          transform: 'translateX(-100%)',
          opacity: '0'
        },
        '.sidebar-enter-active': {
          transform: 'translateX(0)',
          opacity: '1',
          transition: 'all 300ms ease-in-out'
        },
        '.sidebar-exit': {
          transform: 'translateX(0)',
          opacity: '1'
        },
        '.sidebar-exit-active': {
          transform: 'translateX(-100%)',
          opacity: '0',
          transition: 'all 300ms ease-in-out'
        }
      }
      
      addUtilities(newUtilities)
    }
  ],
}