<template>
  <div
    class="hud-canvas"
    :class="{ 'light-theme': theme === 'light', 'server-offline': !systemOnline }"
    :style="hudAccentStyle"
  >
    <div class="ambient-mesh" :class="{ 'light-active': systemOnline && lightActive }"></div>

    <LoadingOverlay :visible="initialLoading" text="正在同步控制面板..." />
    <ToastMessage />

    <header class="top-nav">
      <div class="sys-heading">
        <div class="sys-title">Hi3861<span class="fw-light">// IoT.04</span></div>
        <div class="sys-subtitle">{{ headerSubtitle }}</div>
      </div>

      <div class="global-controls">
        <button
          class="skeuo-btn circle-btn"
          :disabled="initialLoading"
          :title="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2.2m0 15.6V22m10-10h-2.2M4.2 12H2m16.87 6.87-1.56-1.56M6.69 6.69 5.13 5.13m12.74 0-1.56 1.56M6.69 17.31l-1.56 1.56" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="skeuo-btn pill-btn status-pill">
          <div class="led-indicator" :class="{ 'led-on': systemOnline }"></div>
          <span class="toggle-text">{{ systemOnline ? 'SYS ONLINE' : 'SYS OFFLINE' }}</span>
        </div>
      </div>
    </header>

    <main class="core-zone">
      <div class="interaction-wrapper" :class="{ 'is-disabled': !systemOnline || loading }">
        <button
          class="recessed-crater"
          :class="{ 'crater-active': systemOnline && lightActive }"
          :disabled="loading || initialLoading"
          @click="handleLightToggle"
        >
          <div class="ambient-rim"></div>

          <div class="crater-floor">
            <svg class="bulb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18h6m-5 4h4m1.09-8c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .34 2.02 1.5 3.5.76.75 1.23 1.51 1.41 2.5v1h6.18v-1z" />
            </svg>
            <div class="state-label">{{ primaryStateLabel }}</div>
            <div class="state-meta">{{ secondaryStateLabel }}</div>
          </div>
        </button>
      </div>

    </main>

    <footer class="floating-data-stream">
      <div class="data-node">
        <span class="label">SIG</span>
        <span class="value">{{ signalDisplay }}</span>
      </div>
      <div class="separator"></div>
      <div class="data-node">
        <span class="label">LAT</span>
        <span class="value">{{ latencyDisplay }}</span>
      </div>
      <div class="separator"></div>
      <div class="data-node">
        <span class="label">UPT</span>
        <span class="value">{{ uptimeDisplay }}</span>
      </div>
      <div class="separator"></div>
      <div class="data-node">
        <span class="label">IP</span>
        <span class="value">{{ ipDisplay }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import { useDevice } from '@/composables/useDevice'
import { useToast } from '@/composables/useToast'

// ============================================
// 根组件 - 主页面布局组装
// 管理整体 UI 状态、主题切换、灯光控制
// ============================================

// 引入设备状态管理
const {
  systemOnline,
  lightActive,
  theme,
  loading,
  initialLoading,
  lastSyncAt,
  signalDisplay,
  latencyDisplay,
  uptimeDisplay,
  ipDisplay,
  fetchStatus,
  toggleLight,
  toggleTheme
} = useDevice()

// 引入 Toast 提示
const toast = useToast()

// ============================================
// 计算属性
// ============================================

// 顶部副标题：显示最后同步时间或等待提示
const headerSubtitle = computed(() => {
  if (!lastSyncAt.value) {
    return 'Awaiting telemetry lock'
  }

  return `Last sync ${lastSyncAt.value}`
})

// 主要状态标签：系统离线 / 灯光开启 / 灯光关闭
const primaryStateLabel = computed(() => {
  if (!systemOnline.value) {
    return 'LINK LOST'
  }

  return lightActive.value ? 'ACTIVE' : 'STANDBY'
})

// 副状态标签
const secondaryStateLabel = computed(() => {
  if (!systemOnline.value) {
    return 'REMOTE SYSTEM OFFLINE'
  }

  return lightActive.value ? 'RED OUTPUT ENGAGED' : 'SYSTEM READY'
})

// 活跃颜色配置：灯光开启时红色主题，关闭时金色主题
const activeColorConfig = computed(() => {
  if (lightActive.value) {
    return {
      accent: '#ff453a',
      mesh: 'rgba(255, 69, 58, 0.12)'
    }
  }

  return {
    accent: theme.value === 'dark' ? '#ffcc00' : '#ff9500',
    mesh: theme.value === 'dark' ? 'rgba(255, 204, 0, 0.1)' : 'rgba(255, 149, 0, 0.08)'
  }
})

// HUD 强调色样式（传递给 CSS 变量）
const hudAccentStyle = computed(() => ({
  '--accent-color': activeColorConfig.value.accent,
  '--mesh-active': activeColorConfig.value.mesh
}))

// ============================================
// 事件处理
// ============================================

// 处理灯光切换操作
async function handleLightToggle() {
  const result = await toggleLight()

  if (!result.success) {
    if (result.type === 'warning') {
      toast.warning(result.message, result.icon)
    } else {
      toast.error(result.message, result.icon || 'disconnect')
    }
    return
  }

  toast.showToast(result.message, result.type, result.icon)
}

// ============================================
// 生命周期
// ============================================

// 组件挂载后获取设备状态
onMounted(async () => {
  const result = await fetchStatus(true)

  if (!result.success) {
    toast.error(result.message, 'disconnect')
  }
})
</script>

<style scoped>
.hud-canvas {
  --bg-color: #15171c;
  --text-primary: #ffffff;
  --text-secondary: #c5cbe1;
  --accent-color: #ffcc00;
  --shadow-light: rgba(255, 255, 255, 0.05);
  --shadow-dark: rgba(0, 0, 0, 0.5);
  --surface-grad-start: #21242c;
  --surface-grad-end: #101216;
  --border-rim: rgba(255, 255, 255, 0.03);
  --mesh-idle: rgba(0, 122, 255, 0.05);
  --mesh-active: rgba(255, 204, 0, 0.1);
  --separator: rgba(255, 255, 255, 0.08);
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-primary);
  transition: background-color 0.5s ease, color 0.5s ease;
}

.hud-canvas.light-theme {
  --bg-color: #eef1f5;
  --text-primary: #1a1d24;
  --text-secondary: #3f4554;
  --accent-color: #ff9500;
  --shadow-light: #ffffff;
  --shadow-dark: rgba(160, 170, 190, 0.4);
  --surface-grad-start: #f6f8fb;
  --surface-grad-end: #e3e7ee;
  --border-rim: rgba(255, 255, 255, 0.8);
  --mesh-idle: rgba(0, 122, 255, 0.03);
  --mesh-active: rgba(255, 149, 0, 0.08);
  --separator: rgba(0, 0, 0, 0.08);
}

.server-offline .ambient-mesh,
.server-offline .core-zone,
.server-offline .floating-data-stream {
  filter: grayscale(0.8) contrast(1.06);
}

.ambient-mesh {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120vw;
  height: 120vh;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at center, var(--mesh-idle) 0%, transparent 60%);
  pointer-events: none;
  transition: background 0.8s ease;
}

.ambient-mesh.light-active {
  background: radial-gradient(circle at center, var(--mesh-active) 0%, transparent 70%);
}

.top-nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 30px 40px 20px;
}

.sys-heading {
  min-width: 0;
}

.sys-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.fw-light {
  margin-left: 6px;
  font-weight: 300;
  color: var(--text-secondary);
}

.sys-subtitle {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 11px;
  letter-spacing: 0.5px;
}

.global-controls {
  display: flex;
  align-items: center;
  gap: 18px;
}

.skeuo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  border: 1px solid var(--border-rim);
  background: linear-gradient(145deg, var(--surface-grad-start), var(--surface-grad-end));
  box-shadow: 4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.skeuo-btn:disabled,
.recessed-crater:disabled {
  cursor: not-allowed;
}

.skeuo-btn:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: 1px 1px 3px var(--shadow-dark), -1px -1px 3px var(--shadow-light), inset 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.circle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.circle-btn svg {
  width: 18px;
  height: 18px;
}

.pill-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  gap: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.status-pill {
  cursor: default;
}

.led-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff453a;
  box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.led-indicator.led-on {
  background: #32d74b;
  box-shadow: 0 0 8px #32d74b;
}

.core-zone {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 20px;
}

.interaction-wrapper {
  position: relative;
  width: min(44vw, 320px);
  height: min(44vw, 320px);
  transition: opacity 0.3s ease;
}

.interaction-wrapper.is-disabled {
  opacity: 0.45;
}

.recessed-crater {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-color);
  box-shadow: inset 8px 8px 16px var(--shadow-dark), inset -8px -8px 16px var(--shadow-light);
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease;
}

.recessed-crater:not(:disabled):active {
  box-shadow: inset 14px 14px 24px var(--shadow-dark), inset -14px -14px 24px var(--shadow-light);
}

.crater-floor {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 50%;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.recessed-crater:not(:disabled):active .crater-floor {
  transform: scale(0.96) translateY(2px);
}

.ambient-rim {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.4s ease;
  pointer-events: none;
}

.recessed-crater.crater-active .ambient-rim {
  opacity: 0.82;
  border-color: var(--accent-color);
  box-shadow: inset 0 0 15px var(--accent-color), 0 0 10px var(--accent-color);
}

.bulb-icon {
  width: 56px;
  height: 56px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.recessed-crater.crater-active .bulb-icon {
  color: var(--accent-color);
  filter: drop-shadow(0 0 12px var(--accent-color));
}

.state-label {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.recessed-crater.crater-active .state-label {
  color: var(--accent-color);
}

.state-meta {
  color: var(--text-secondary);
  font-size: 11px;
  letter-spacing: 1.8px;
  text-align: center;
}

.floating-data-stream {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 24px;
  padding: 28px 40px 40px;
}

.data-node {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
}

.value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 500;
}

.separator {
  width: 1px;
  height: 20px;
  background: var(--separator);
}

@media (max-width: 900px) {
  .top-nav {
    padding: 24px 24px 12px;
  }

  .floating-data-stream {
    padding: 24px 24px 32px;
    gap: 16px;
  }

  .interaction-wrapper {
    width: min(56vw, 280px);
    height: min(56vw, 280px);
  }
}

@media (max-width: 640px) {
  .hud-canvas {
    min-height: 100dvh;
  }

  .top-nav {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px 16px 10px;
  }

  .global-controls {
    justify-content: space-between;
  }

  .core-zone {
    gap: 22px;
    padding: 12px 16px 24px;
  }

  .interaction-wrapper {
    width: min(68vw, 260px);
    height: min(68vw, 260px);
  }

  .bulb-icon {
    width: 48px;
    height: 48px;
  }

  .state-label {
    font-size: 14px;
    letter-spacing: 3px;
  }

  .state-meta {
    font-size: 10px;
    letter-spacing: 1.3px;
  }

  .floating-data-stream {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 18px;
    padding: 0 16px 24px;
  }

  .separator {
    display: none;
  }

  .data-node {
    padding: 12px 10px;
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.08));
    box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.02), inset -1px -1px 0 rgba(0, 0, 0, 0.08);
  }

  .hud-canvas.light-theme .data-node {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(220, 226, 236, 0.7));
  }
}
</style>
