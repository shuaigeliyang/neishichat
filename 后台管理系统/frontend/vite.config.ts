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
    port: 5176,  // ✨ 后台管理系统前端固定端口
    strictPort: true,  // 强制使用固定端口，被占用时直接报错而不是换端口
    proxy: {
      '/api': {
        target: 'http://localhost:3005',  // ✨ 代理到后台后端
        changeOrigin: true,
      },
    },
  },
})
