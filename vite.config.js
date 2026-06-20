import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// ============================================
// Vite 配置文件
// 配置插件、路径别名、服务器代理
// ============================================

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  // 设备目标地址，默认本地 Mock 服务器
  const deviceTarget = env.VITE_DEVICE_TARGET || 'http://192.168.12.1'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        // 路径别名：@ 指向 src 目录
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      // 开发服务器代理配置
      proxy: {
        // 将 /api/* 请求代理到目标设备服务器
        '/api': {
          target: deviceTarget,
          changeOrigin: true,
          // 移除 /api 前缀后再转发
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
