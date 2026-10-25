import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path configured for GitHub Pages repo: /RAG-Knowledge-Assistant/
export default defineConfig({
  plugins: [react()],
  base: '/RAG-Knowledge-Assistant/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
