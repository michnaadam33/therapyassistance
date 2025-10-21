import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/patients': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/appointments': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/session_notes': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
