import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    // 代理配置：将 /api 开头的请求转发到 mock 服务
    // 这样前端代码中只需要请求 /api/xxx，Vite 会自动转发到 mock 服务
    // 未来切换到真实 NodeMCU 时，只需修改这里的 target 或直接改 axios 的 baseURL
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
