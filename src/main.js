/**
 * 应用入口文件
 * 创建 Vue 应用实例，挂载全局样式
 */

import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)
app.mount('#app')
