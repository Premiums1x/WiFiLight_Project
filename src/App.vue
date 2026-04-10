<template>
  <div class="app">
    <!-- 全屏 Loading（首次加载时显示） -->
    <LoadingOverlay
      :visible="initialLoading"
      text="正在连接设备..."
    />

    <!-- 页面标题 -->
    <AppHeader />

    <!-- 状态卡片 -->
    <StatusCards
      :device-online="deviceOnline"
      :light-on="lightOn"
    />

    <!-- 核心控制按钮 -->
    <ControlButton
      :light-on="lightOn"
      :loading="loading"
      :disabled="buttonDisabled"
      :text="buttonText"
      @toggle="handleToggle"
    />

    <!-- 信息面板：时间、操作记录、刷新 -->
    <InfoPanel
      :updated-at="updatedAt"
      :last-action="lastAction"
      :error="error"
      :loading="loading"
      @refresh="handleRefresh"
    />

    <!-- 底部说明 -->
    <footer class="app-footer">
      <p>WiFi Smart Light · 课程设计项目</p>
      <p class="footer-tech">Vue 3 + Vite + Axios + Express Mock</p>
    </footer>

    <!-- Toast 消息提示 -->
    <ToastMessage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDevice } from '@/composables/useDevice'
import { useToast } from '@/composables/useToast'

// 组件导入
import AppHeader from '@/components/AppHeader.vue'
import StatusCards from '@/components/StatusCards.vue'
import ControlButton from '@/components/ControlButton.vue'
import InfoPanel from '@/components/InfoPanel.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ToastMessage from '@/components/ToastMessage.vue'

// 使用组合式函数
const {
  deviceOnline,
  lightOn,
  updatedAt,
  loading,
  initialLoading,
  lastAction,
  error,
  buttonDisabled,
  buttonText,
  fetchStatus,
  toggleLight,
  refreshStatus
} = useDevice()

const toast = useToast()

/**
 * 页面初始化：自动获取设备状态
 */
onMounted(async () => {
  await fetchStatus(true)
  if (error.value) {
    toast.error('连接设备失败，请检查网络后点击刷新')
  } else {
    toast.success('设备连接成功')
  }
})

/**
 * 切换灯的状态
 */
async function handleToggle() {
  const result = await toggleLight()
  if (result.success) {
    toast.success(result.message)
  } else {
    toast.error(result.message)
  }
}

/**
 * 刷新设备状态
 */
async function handleRefresh() {
  const result = await refreshStatus()
  if (result.success) {
    toast.success('状态已刷新')
  } else {
    toast.error(result.message)
  }
}
</script>

<style scoped>
.app {
  padding-bottom: 40px;
}

.app-footer {
  text-align: center;
  padding: 32px 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  margin: 0 20px;
}

.app-footer p {
  font-size: 12px;
  color: #475569;
  line-height: 1.8;
}

.footer-tech {
  font-size: 11px;
  color: #334155;
  letter-spacing: 0.5px;
}
</style>
