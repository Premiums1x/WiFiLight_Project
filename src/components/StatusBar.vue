<template>
  <div class="status-bar">
    <span class="sb-time" id="sb-time">{{ currentTime }}</span>
    <div class="sb-icons">
      <!-- 信号强度 -->
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <rect x="0" y="7" width="3" height="5" rx="1" fill="#1c1c1e"/>
        <rect x="4.5" y="4.5" width="3" height="7.5" rx="1" fill="#1c1c1e"/>
        <rect x="9" y="2" width="3" height="10" rx="1" fill="#1c1c1e"/>
        <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#1c1c1e"/>
      </svg>
      <!-- WiFi -->
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
        <path d="M7.5 2.5C9.8 2.5 11.9 3.4 13.4 4.9L14.5 3.8C12.7 2 10.2 1 7.5 1S2.3 2 .5 3.8l1.1 1.1C3.1 3.4 5.2 2.5 7.5 2.5z" fill="#1c1c1e"/>
        <path d="M7.5 5C9 5 10.4 5.6 11.4 6.6L12.5 5.5C11.2 4.2 9.4 3.5 7.5 3.5S3.8 4.2 2.5 5.5l1.1 1.1C4.6 5.6 6 5 7.5 5z" fill="#1c1c1e"/>
        <path d="M7.5 7.5c.9 0 1.7.4 2.3.9L11 7.2C10.1 6.4 8.8 6 7.5 6S4.9 6.4 4 7.2l1.2 1.2C5.8 7.9 6.6 7.5 7.5 7.5z" fill="#1c1c1e"/>
        <circle cx="7.5" cy="10" r="1.2" fill="#1c1c1e"/>
      </svg>
      <!-- 电池 -->
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
        <rect x="0" y="1" width="21" height="10" rx="3" stroke="#1c1c1e" stroke-width="1.2"/>
        <rect x="22" y="4" width="2.5" height="4" rx="1" fill="#1c1c1e" opacity=".5"/>
        <rect x="1.5" y="2.5" width="15" height="7" rx="2" fill="#34C759"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ============================================
// 状态栏组件
// 显示当前时间、信号、WiFi、电池图标
// ============================================

// 当前时间字符串（格式：HH:mm）
const currentTime = ref('')
// 定时器引用
let timer = null

// 更新当前时间
function updateTime() {
  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes()
  currentTime.value = h + ':' + (m < 10 ? '0' : '') + m
}

// 挂载、定时器，更新
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 15000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.status-bar {
  background: #F2F2F7;
  padding: 14px 28px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sb-time {
  font-size: 15px;
  font-weight: 700;
  color: #1c1c1e;
  letter-spacing: -0.3px;
}

.sb-icons {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
