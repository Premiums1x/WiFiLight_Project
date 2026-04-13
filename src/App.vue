<template>
  <div class="app">
    <!-- 全屏 Loading（首次加载时显示） -->
    <LoadingOverlay
      :visible="initialLoading"
      text="正在连接设备..."
    />

    <!-- iPhone 模拟器外壳 -->
    <div class="phone" id="phone-frame">
      <!-- 内容区域 -->
      <div class="ac">
        <!-- 页面标题 -->
        <h1 class="hdg">智能家居</h1>
        <div class="sub" id="sub-date">{{ currentDate }}</div>

        <!-- 连接状态卡片 -->
        <ConnectionCard
          :is-connected="isConnected"
          @toggle="handleConnectionToggle"
        />

        <!-- 灯光控制区 -->
        <LightControl
          :light-on="lightOn"
          :loading="loading"
          :disabled="!isConnected"
          @toggle="handleLightToggle"
        />

        <!-- 四宫格设备信息 -->
        <QuickStats
          :signal-strength="signalStrength"
          :uptime-formatted="uptimeFormatted"
          :local-i-p="localIP"
          :ping-latency="pingLatency"
        />


      </div>
    </div>

    <!-- Toast 消息提示 -->
    <ToastMessage />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDevice } from '@/composables/useDevice'
import { useToast } from '@/composables/useToast'

// 组件导入

import ConnectionCard from '@/components/ConnectionCard.vue'
import LightControl from '@/components/LightControl.vue'
import QuickStats from '@/components/QuickStats.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ToastMessage from '@/components/ToastMessage.vue'

// 使用组合式函数
const {
  lightOn,
  loading,
  initialLoading,
  error,
  isConnected,
  signalStrength,
  localIP,
  pingLatency,
  uptimeFormatted,
  fetchStatus,
  toggleLight,
  toggleConnection
} = useDevice()

const toast = useToast()

// 当前日期
const currentDate = ref('')
let dateTimer = null

function updateDate() {
  const d = new Date()
  currentDate.value = d.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

/**
 * 页面初始化
 */
onMounted(async () => {
  updateDate()
  dateTimer = setInterval(updateDate, 60000)

  // 获取初始设备状态
  await fetchStatus(true)

  // 自动连接（模拟原型的 setTimeout(tConn, 600) 行为）
  setTimeout(async () => {
    const result = await toggleConnection()
    if (result.success) {
      toast.success(result.message)
    }
  }, 600)
})

onUnmounted(() => {
  if (dateTimer) clearInterval(dateTimer)
})

/**
 * 切换连接状态
 */
async function handleConnectionToggle() {
  const wasConnected = isConnected.value
  const result = await toggleConnection()
  if (result.success) {
    if (isConnected.value) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  } else {
    toast.error(result.message)
  }
}

/**
 * 切换灯的状态
 */
async function handleLightToggle() {
  const result = await toggleLight()
  if (result.success) {
    if (lightOn.value) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  } else {
    toast.error(result.message)
  }
}
</script>

<style scoped>
.app {
  width: 100%;
}

/* iPhone 模拟器外壳 */
.phone {
  width: 100%;
  background: #F2F2F7;
  border-radius: 44px;
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.06),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.5);
}

/* 内容区 */
.ac {
  padding: 18px 16px 28px;
}

/* 标题 */
.hdg {
  font-size: 24px;
  font-weight: 800;
  color: #1c1c1e;
  margin: 0 0 2px;
  letter-spacing: -0.6px;
}

/* 副标题（日期） */
.sub {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 18px;
}
</style>
