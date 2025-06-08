import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // הגדרת aliases לנתיבים
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/pages': path.resolve(__dirname, './src/pages'),
    },
  },

  // הגדרות שרת הפיתוח
  server: {
    port: 3000,
    host: true, // מאפשר גישה מרשת חיצונית
    
    // Proxy עבור API calls לשרת Backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // כתובת שרת ה-.NET
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''), // אם צריך להסיר את /api
      },
      
      // Proxy נוסף עבור uploads (אם יש endpoint נפרד)
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
  },

  // הגדרות build
  build: {
    outDir: 'dist',
    sourcemap: true, // מפות קוד לדיבוג
    
    // אופטימיזציות
    rollupOptions: {
      output: {
        manualChunks: {
          // פיצול ספריות גדולות לקבצים נפרדים
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'react-query', 'zustand'],
        },
      },
    },
    
    // הגדרות ביצועים
    chunkSizeWarningLimit: 1000, // אזהרה על chunks גדולים מ-1MB
  },

  // הגדרות CSS
  css: {
    devSourcemap: true, // Source maps עבור CSS בפיתוח
  },

  // הגדרות optimizeDeps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      '@tanstack/react-query',
      'zustand',
      'react-hook-form',
      'react-hot-toast',
    ],
  },

  // הגדרות environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // הגדרות preview (לבדיקת build)
  preview: {
    port: 4173,
    host: true,
  },
})