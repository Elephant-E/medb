import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: true, // 允许局域网访问
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    proxy: {
      '/media': {
        target: 'https://medb.lat',
        changeOrigin: true,
      },
      '/sign': {
        target: 'https://medb.lat',
        changeOrigin: true,
      },
      '/file': {
        target: 'https://medb.lat',
        changeOrigin: true,
      }
    }
  }
})
