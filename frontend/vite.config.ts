import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProd = (process as NodeJS.Process).env.NODE_ENV === 'production';

export default defineConfig({
  base: isProd ? '/todo/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/todo/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/todo/, '')
      }
    }
  }
})
