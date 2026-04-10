<template>
  <div class="control-section">
    <!-- 灯光光环效果 -->
    <div :class="['glow-ring', { 'glow-active': lightOn && !loading }]"></div>

    <!-- 核心控制按钮 -->
    <button
      :class="[
        'control-btn',
        {
          'btn-on': lightOn && !loading,
          'btn-off': !lightOn && !loading,
          'btn-loading': loading,
          'btn-disabled': disabled
        }
      ]"
      :disabled="disabled"
      @click="$emit('toggle')"
    >
      <!-- 灯泡 SVG 图标 -->
      <div class="btn-icon">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 灯泡主体 -->
          <path
            d="M32 6C22.06 6 14 14.06 14 24c0 6.34 3.28 11.9 8.22 15.12C23.68 40.1 24 41.48 24 42.9V46c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3.1c0-1.42.32-2.8 1.78-3.78C46.72 35.9 50 30.34 50 24c0-9.94-8.06-18-18-18z"
            :fill="lightOn ? 'url(#bulbGradOn)' : 'url(#bulbGradOff)'"
            :stroke="lightOn ? '#fbbf24' : '#475569'"
            stroke-width="1.5"
            class="bulb-body"
          />
          <!-- 灯座 -->
          <rect x="24" y="48" width="16" height="3" rx="1" :fill="lightOn ? '#d97706' : '#334155'" />
          <rect x="26" y="52" width="12" height="3" rx="1" :fill="lightOn ? '#b45309' : '#1e293b'" />
          <rect x="28" y="56" width="8" height="2" rx="1" :fill="lightOn ? '#92400e' : '#1e293b'" />
          <!-- 灯丝 -->
          <path
            v-if="lightOn"
            d="M28 30c1-4 3-4 4 0s3 4 4 0"
            stroke="#fef3c7"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
            class="filament"
          />
          <!-- 渐变定义 -->
          <defs>
            <radialGradient id="bulbGradOn" cx="32" cy="24" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef3c7"/>
              <stop offset="40%" stop-color="#fbbf24"/>
              <stop offset="100%" stop-color="#f59e0b"/>
            </radialGradient>
            <radialGradient id="bulbGradOff" cx="32" cy="24" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#334155"/>
              <stop offset="100%" stop-color="#1e293b"/>
            </radialGradient>
          </defs>
        </svg>

        <!-- 光芒射线（亮灯时显示） -->
        <div v-if="lightOn && !loading" class="light-rays">
          <span v-for="i in 8" :key="i" class="ray" :style="{ transform: `rotate(${i * 45}deg)` }"></span>
        </div>
      </div>

      <!-- Loading 旋转环 -->
      <div v-if="loading" class="btn-spinner">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="80, 200" class="spinner-circle"/>
        </svg>
      </div>

      <!-- 按钮文字 -->
      <span class="btn-text">{{ text }}</span>
    </button>

    <!-- 操作提示 -->
    <p class="control-hint" v-if="!disabled && !loading">
      {{ lightOn ? '点击关闭灯光' : '点击开启灯光' }}
    </p>
    <p class="control-hint hint-warning" v-else-if="disabled && !loading">
      设备离线，无法操作
    </p>
  </div>
</template>

<script setup>
defineProps({
  lightOn: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '开启灯光'
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
.control-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 24px;
  position: relative;
}

/* 背景光环 */
.glow-ring {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  background: radial-gradient(circle, rgba(251, 191, 36, 0) 60%, rgba(251, 191, 36, 0) 100%);
  transition: all 0.8s ease;
  pointer-events: none;
}

.glow-active {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0) 70%);
  animation: glow-pulse 3s ease-in-out infinite;
}

/* 核心按钮 */
.control-btn {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}

.btn-off {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-color: rgba(71, 85, 105, 0.4);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.btn-off:hover:not(:disabled) {
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow:
    0 4px 32px rgba(251, 191, 36, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transform: scale(1.03);
}

.btn-off:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-on {
  background: linear-gradient(145deg, #422006, #78350f);
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow:
    0 4px 32px rgba(251, 191, 36, 0.25),
    0 0 60px rgba(251, 191, 36, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-on:hover:not(:disabled) {
  box-shadow:
    0 4px 40px rgba(251, 191, 36, 0.35),
    0 0 80px rgba(251, 191, 36, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: scale(1.03);
}

.btn-on:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-loading {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-color: rgba(59, 130, 246, 0.3);
  cursor: wait;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-disabled:hover {
  transform: none !important;
}

/* 灯泡图标 */
.btn-icon {
  width: 64px;
  height: 64px;
  position: relative;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

.bulb-body {
  transition: all 0.5s ease;
}

/* 灯丝动画 */
.filament {
  animation: flicker 3s ease-in-out infinite;
}

/* 光芒射线 */
.light-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
}

.ray {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 2px;
  height: 10px;
  margin-left: -1px;
  background: linear-gradient(to top, rgba(251, 191, 36, 0.6), transparent);
  transform-origin: 50% 42px;
  border-radius: 1px;
  animation: ray-pulse 2s ease-in-out infinite;
}

.ray:nth-child(2n) {
  animation-delay: 0.3s;
  opacity: 0.6;
  height: 8px;
}

/* Loading 旋转 */
.btn-spinner {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
}

.btn-spinner svg {
  width: 100%;
  height: 100%;
  animation: spin 1.2s linear infinite;
}

.spinner-circle {
  color: #60a5fa;
}

/* 按钮文字 */
.btn-text {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.5px;
  transition: color 0.3s;
}

.btn-on .btn-text {
  color: #fbbf24;
}

.btn-loading .btn-text {
  color: #60a5fa;
}

/* 操作提示 */
.control-hint {
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

.hint-warning {
  color: #f87171;
}

/* 动画 */
@keyframes glow-pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -55%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -55%) scale(1.08);
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

@keyframes ray-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>
